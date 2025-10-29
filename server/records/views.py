from django.utils import timezone
from rest_framework import viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from records.models import MilalMatching, VolunteerHours
from records.serializers import MilalMatchingSerializer, VolunteerHoursSerializer
from django.core.mail import EmailMessage
from django.conf import settings
from django.db.models import Sum
import os
import tempfile
import subprocess
from datetime import datetime
from pathlib import Path
from authz.permissions import HasAdminPermission
from users.models import Volunteer, EmailAccount
from users.utils import calculate_volunteer_hours_with_bonus
from records.utils import (
    check_libreoffice, convert_datetime_to_month_year, generate_docx_report,
    convert_docx_to_pdf_libreoffice, generate_text_report, generate_hours_logs_file,
    generate_volunteer_pdf_report, DOCX_SUPPORT
)


class MilalMatchingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Milal Matching
    """

    permission_classes = [IsAuthenticated]

    queryset = MilalMatching.objects.all().order_by("-created_at")
    serializer_class = MilalMatchingSerializer
    filterset_fields = {
        "volunteer": ["exact"],
        "milal_friend": ["exact"],
        "created_at": ["gte", "lte", "exact", "gt", "lt"],
        "match_date": ["gte", "lte", "exact", "gt", "lt"],
    }

    @action(
        detail=False,
        methods=["post"],
        url_path="match",
        url_name="match",
    )
    def match(self, request, *args, **kwargs):
        
        data = request.data

        # Serialize the data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Check if match already exists for the day
        milal_friend = serializer.validated_data.get('milal_friend')
        volunteer = serializer.validated_data.get('volunteer')
        local_date = timezone.localtime(timezone.now()).date()

        # For self-match requests, check if the user is already matched. If so, ignore.
        if volunteer == None:
            any_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=milal_friend, volunteer__isnull=False)
            if any_match.exists():
                return Response(status=status.HTTP_202_ACCEPTED)

        # For regular match requests, check if match already exists. Do not create a new instance and return 200 response
        else:
            milal_match = MilalMatching.objects.filter(match_date=local_date, milal_friend=milal_friend, volunteer=volunteer)
            if milal_match.exists():
                return Response(status=status.HTTP_202_ACCEPTED)
            
            # Delete self match record if exists
            MilalMatching.objects.filter(
                match_date=local_date, milal_friend=milal_friend, volunteer=None).delete()

        # Save the instance
        self.perform_create(serializer)
        
        # Customize response if needed
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(
        detail=False,
        methods=["post"],
        url_path="unmatch",
        url_name="unmatch",
    )
    def unmatch(self, request, *args, **kwargs):
        
        data = request.data

        # Serialize the data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Search and delete if match already exists for the day
        milal_friend = serializer.validated_data.get('milal_friend')
        volunteer = serializer.validated_data.get('volunteer')
        local_date = timezone.localtime(timezone.now()).date()

        filter_dict = { "match_date": local_date }
        if milal_friend:
            filter_dict["milal_friend"] = milal_friend
        if volunteer:
            filter_dict["volunteer"] = volunteer

        MilalMatching.objects.filter(**filter_dict).delete()

        # Customize response if needed
        return Response(status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="with_recommendations",
        url_name="with_recommendations",
    )
    def with_recommendations(self, request):
        """
        Get match data with recommendations for a specific user.
        Returns the normal match list plus a 'recommended_match' key with user recommendations.
        """
        from users.models import Volunteer, MilalFriend
        from users.serializers import VolunteerSerializer, MilalFriendSerializer
        
        volunteer_id = request.query_params.get('volunteer')
        milal_friend_id = request.query_params.get('milal_friend')
        
        if not volunteer_id and not milal_friend_id:
            return Response(
                {'error': 'Either volunteer or milal_friend parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if volunteer_id and milal_friend_id:
            return Response(
                {'error': 'Only one of volunteer or milal_friend parameter should be provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the normal match data using the existing list method
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            match_data = serializer.data
            
            # Get user recommendations
            recommended_match = []
            if volunteer_id:
                try:
                    volunteer = Volunteer.objects.get(id=volunteer_id)
                    volunteer_serializer = VolunteerSerializer(volunteer)
                    recommended_match = volunteer_serializer.data.get('recommended_match', [])
                except Volunteer.DoesNotExist:
                    return Response(
                        {'error': 'Volunteer not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:  # milal_friend_id
                try:
                    milal_friend = MilalFriend.objects.get(id=milal_friend_id)
                    milal_friend_serializer = MilalFriendSerializer(milal_friend)
                    recommended_match = milal_friend_serializer.data.get('recommended_match', [])
                except MilalFriend.DoesNotExist:
                    return Response(
                        {'error': 'MilalFriend not found'}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Return match data with recommendations
            return Response({
                'matches': match_data,
                'recommended_match': recommended_match
            })
            
        except Exception as e:
            return Response(
                {'error': f'An error occurred: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VolunteerHoursViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing volunteer hours
    """

    permission_classes = [IsAuthenticated]

    queryset = VolunteerHours.objects.all().order_by("-created_at")
    serializer_class = VolunteerHoursSerializer
    filterset_fields = {
        "volunteer": ["exact", "isnull"],
        "email": ["exact"],
        "service_type": ["exact"],
        "service_date": ["exact", "gte", "lte"],
    }

    @action(
        detail=False,
        methods=["post"],
        url_path="bulk_create",
        url_name="bulk_create",
    )
    def bulk_create(self, request):
        volunteer_ids = request.data.get("volunteer_ids")
        if not volunteer_ids:
            return Response(
                {'error': 'volunteer_ids is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a copy of request.data to avoid modifying the original
        data_copy = request.data.copy()
        data_copy.pop("volunteer_ids", None)
        bulk_create_list = [{"volunteer": vId, **data_copy} for vId in volunteer_ids]

        # Copied from CreateModelMixin
        serializer = self.get_serializer(data=bulk_create_list, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    @action(detail=False, methods=['post'])
    def send_volunteer_report(self, request):
        """
        Send volunteer hours reports via email to all linked email accounts for one or more volunteers
        """
        volunteer_ids = request.data.get('volunteer_ids', [])
        attach_hours_logs = request.data.get('attach_hours_logs', False)
        
        if not volunteer_ids:
            return Response(
                {'error': 'volunteer_ids or volunteer_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        errors = []
        
        for volunteer_id in volunteer_ids:
            try:
                # Get volunteer
                volunteer = Volunteer.objects.get(id=volunteer_id)
            except Volunteer.DoesNotExist:
                errors.append((f'Volunteer with ID {volunteer_id} does not exist', 'Unknown Volunteer'))
                continue
            
            # Get linked email accounts
            linked_emails = EmailAccount.objects.filter(user=volunteer)
            if not linked_emails.exists():
                errors.append((f'No linked email accounts found for volunteer', f'{volunteer.first_name} {volunteer.last_name}'))
                continue
            
            try:
                # Get volunteer hours
                hours_entries = VolunteerHours.objects.filter(volunteer=volunteer).order_by('service_date')
                
                if not hours_entries.exists():
                    raise Exception(f'No volunteer hours found')
                
                # Generate PDF report
                pdf_path, start_date, end_date = generate_volunteer_pdf_report(volunteer, hours_entries)
                
                # Generate text logs if requested
                text_logs_path = None
                if attach_hours_logs:
                    text_logs_path = generate_hours_logs_file(volunteer, hours_entries, start_date, end_date)
                
                # Send email with attachment
                self._send_report_email(volunteer, linked_emails, pdf_path, start_date, end_date, text_logs_path)
                
                # Clean up temporary files
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
                if text_logs_path and os.path.exists(text_logs_path):
                    os.remove(text_logs_path)
                
                results.append({
                    'volunteer_id': volunteer_id,
                    'volunteer_name': f'{volunteer.first_name} {volunteer.last_name}',
                    'email_count': linked_emails.count(),
                    'status': 'success',
                    'message': f'Report sent successfully to {linked_emails.count()} email account(s)'
                })
                
            except Exception as e:
                # Clean up any temporary files that might have been created
                if 'pdf_path' in locals() and os.path.exists(pdf_path):
                    try:
                        os.remove(pdf_path)
                    except:
                        pass
                if 'text_logs_path' in locals() and text_logs_path and os.path.exists(text_logs_path):
                    try:
                        os.remove(text_logs_path)
                    except:
                        pass
                
                errors.append((f'Failed to send report: {str(e)}', f'{volunteer.first_name} {volunteer.last_name}'))
        
        # Prepare response
        if errors and not results:
            # All failed
            error_details = [error[0] for error in errors]
            return Response(
                {'error': 'All reports failed to send', 'details': error_details}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        elif errors and results:
            # Some succeeded, some failed
            successful_names = [result['volunteer_name'] for result in results]
            
            total_emails = sum(result['email_count'] for result in results)
            
            return Response({
                'success': True,
                'message': f'Reports sent successfully for {len(results)} volunteer(s), {len(errors)} failed',
                'successful_volunteers': successful_names,
                'failed_volunteers': errors,
                'total_emails_sent': total_emails,
                'total_sent': len(results),
                'total_failed': len(errors)
            })
        else:
            # All succeeded
            successful_names = [result['volunteer_name'] for result in results]
            total_emails = sum(result['email_count'] for result in results)
            
            return Response({
                'success': True,
                'message': f'Reports sent successfully for {len(results)} volunteer(s)',
                'successful_volunteers': successful_names,
                'total_emails_sent': total_emails,
                'total_sent': len(results),
                'total_failed': 0
            })
    
    def _send_report_email(self, volunteer, linked_emails, pdf_path, start_date, end_date, text_logs_path):
        """Send the report email to all linked email accounts"""
        volunteer_name = f"{volunteer.first_name} {volunteer.last_name}"
        current_date = datetime.now().strftime('%Y-%m-%d')
        start_month, end_month = convert_datetime_to_month_year(start_date, end_date)
        volunteer_period = f"{start_month} to {end_month}"
        
        # Email content
        subject = f"Milal Volunteer Hours Report - {volunteer_name} - {current_date}"
        
        # Choose template based on whether volunteer has bonus percentage
        if volunteer.bonus_percentage and volunteer.bonus_percentage > 0:
            template_filename = 'volunteer_email_with_bonus_template.txt'
        else:
            template_filename = 'volunteer_email_template.txt'
        
        # Read email template from text file
        template_path = Path(__file__).parent / 'templates' / template_filename
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                template_content = f.read()
        except FileNotFoundError:
            # Fallback template if text file is not found
            raise Exception("Email template file not found")

        # Replace placeholders in template
        body = template_content.format(
            volunteer_name=volunteer_name,
            report_date=current_date,
            volunteer_period=volunteer_period
        ).strip()
        
        try:
            # Create email message
            email = EmailMessage(
                subject=subject,
                body=body,  # Plain text version
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email_account.email for email_account in linked_emails],
                cc=[settings.DEFAULT_FROM_EMAIL]  # CC the sending email
            )
            
            # Attach the PDF
            with open(pdf_path, 'rb') as pdf_file:
                email.attach(
                    f'volunteer_hours_report_{volunteer_name.replace(" ", "_")}_{current_date}.pdf',
                    pdf_file.read(),
                    'application/pdf'
                )
            
            # Attach text logs if available
            if text_logs_path:
                with open(text_logs_path, 'rb') as text_logs_file:
                    email.attach(
                        f'volunteer_hours_logs_{volunteer_name.replace(" ", "_")}_{current_date}.txt',
                        text_logs_file.read(),
                        'text/plain'
                    )
            
            # Send the email
            email.send()
        except Exception as e:
            raise Exception(f'Failed to send email: {str(e)}')
