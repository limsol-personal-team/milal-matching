import datetime
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Sum
from records.models import VolunteerHours
from users.models import Volunteer
from users.utils import calculate_volunteer_hours_with_bonus
from records.utils import (
    check_libreoffice, convert_datetime_to_month_year, generate_docx_report,
    convert_docx_to_pdf_libreoffice, generate_text_report, generate_hours_logs_file,
    generate_volunteer_pdf_report, DOCX_SUPPORT
)
import os
import subprocess
from pathlib import Path
import shutil

class Command(BaseCommand):
    help = 'Export volunteer hours for a specific volunteer within a date range'

    def add_arguments(self, parser):
        parser.add_argument('volunteer_id', type=str, help='ID of the volunteer (UUID)')
        parser.add_argument('--start_date', type=str, help='Start date (YYYY-MM-DD). If not provided, earliest record will be used.')
        parser.add_argument('--end_date', type=str, help='End date (YYYY-MM-DD). If not provided, latest record will be used.')
        parser.add_argument('--docx', action='store_true', help='Generate Word document report using the template')
        parser.add_argument('--docx_output', type=str, default='volunteer_hours_report.docx',
                          help='Output Word document file name (default: volunteer_hours_report.docx)')
        parser.add_argument('--pdf', action='store_true', help='Generate PDF report by converting the DOCX template')
        parser.add_argument('--pdf_output', type=str, default='volunteer_hours_report.pdf',
                          help='Output PDF file name (default: volunteer_hours_report.pdf)')
        parser.add_argument('--logs', action='store_true', help='Generate detailed hours logs file')
        parser.add_argument('--logs_output', type=str, default='volunteer_hours_logs.txt',
                          help='Output logs file name (default: volunteer_hours_logs.txt)')

    def handle(self, *args, **options):
        volunteer_id = options['volunteer_id']
        start_date_str = options.get('start_date')
        end_date_str = options.get('end_date')
        generate_docx = options['docx']
        docx_output = options['docx_output']
        generate_pdf = options['pdf']
        pdf_output = options['pdf_output']
        generate_logs = options['logs']
        logs_output = options['logs_output']
        
        if generate_docx and not DOCX_SUPPORT:
            self.stdout.write(self.style.WARNING(
                'Word document generation requires python-docx library. '
                'Please install it with "pip install python-docx"'
            ))
            generate_docx = False
            
        if generate_pdf and not DOCX_SUPPORT:
            self.stdout.write(self.style.WARNING(
                'PDF generation requires python-docx library for creating the source document. '
                'Please install it with "pip install python-docx"'
            ))
            generate_pdf = False
        
        # Check if LibreOffice is available for PDF conversion
        if generate_pdf and not check_libreoffice():
            self.stdout.write(self.style.WARNING(
                'PDF generation requires LibreOffice to be installed. '
                'Please install LibreOffice or use --docx flag instead.'
            ))
            generate_pdf = False
        
        try:
            # Check if volunteer exists
            try:
                volunteer = Volunteer.objects.get(id=volunteer_id)
            except Volunteer.DoesNotExist:
                raise CommandError(f'Volunteer with ID {volunteer_id} does not exist')
            
            # Base query for this volunteer
            query_filters = {'volunteer_id': volunteer_id}
            
            # Parse and add date filters if provided
            start_date = None
            end_date = None
            
            if start_date_str:
                try:
                    start_date = datetime.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    query_filters['service_date__date__gte'] = start_date
                except ValueError:
                    raise CommandError('Invalid start_date format. Please use YYYY-MM-DD')
            
            if end_date_str:
                try:
                    end_date = datetime.datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    query_filters['service_date__date__lte'] = end_date
                except ValueError:
                    raise CommandError('Invalid end_date format. Please use YYYY-MM-DD')
            
            # Get volunteer hours with applied filters
            hours_entries = VolunteerHours.objects.filter(**query_filters).order_by('service_date')
            
            if not hours_entries:
                self.stdout.write(self.style.WARNING(
                    f'No volunteer hours found for volunteer {volunteer.first_name} {volunteer.last_name}'
                ))
                return
            
            # Get actual date range for output
            if not start_date_str:
                earliest_record = hours_entries.earliest('service_date')
                start_date_str = earliest_record.service_date.strftime('%Y-%m-%d')
            
            if not end_date_str:
                latest_record = hours_entries.latest('service_date')
                end_date_str = latest_record.service_date.strftime('%Y-%m-%d')
            
            self.stdout.write(f'--------------------------------')
            self.stdout.write(f'Earliest record date: {start_date_str}')
            self.stdout.write(f'Latest record date: {end_date_str}')
            self.stdout.write(f'--------------------------------')
            
            # Calculate total hours including bonus percentage
            total_hours, bonus_hours = calculate_volunteer_hours_with_bonus(volunteer, hours_entries)
            
            # Generate detailed logs file if requested
            if generate_logs:
                try:
                    # Generate text logs if requested
                    text_logs_path = generate_hours_logs_file(volunteer, hours_entries, start_date_str, end_date_str)
                    
                    # Copy the generated file to the specified output location
                    shutil.copy2(text_logs_path, logs_output)
                    
                    # Clean up temporary file
                    if os.path.exists(text_logs_path):
                        os.remove(text_logs_path)
                    
                    self.stdout.write(self.style.SUCCESS(f'* Detailed logs saved to {logs_output}'))
                except Exception as e:
                    # Clean up any temporary files that might have been created
                    if 'text_logs_path' in locals() and text_logs_path and os.path.exists(text_logs_path):
                        try:
                            os.remove(text_logs_path)
                        except:
                            pass
                    self.stdout.write(self.style.ERROR(f'Error generating logs file: {str(e)}'))
            
            # Determine if we need to create a temporary DOCX file for PDF conversion
            temp_docx_for_pdf = False
            docx_file_path = docx_output
            
            if generate_pdf and not generate_docx:
                # Create a temporary DOCX file for PDF conversion
                temp_docx_for_pdf = True
                docx_file_path = f"temp_{pdf_output.replace('.pdf', '.docx')}"
            
            # Generate Word document if requested or needed for PDF
            if generate_docx or generate_pdf:
                # Use template path from management/commands directory
                current_dir = Path(__file__).parent
                template_path = current_dir / 'volunteer_report_template.docx'
                
                generate_docx_report(
                    volunteer=volunteer,
                    start_date=start_date_str,
                    end_date=end_date_str,
                    total_hours=total_hours,
                    output_file=docx_file_path,
                    template_path=template_path
                )
                if generate_docx:
                    self.stdout.write(self.style.SUCCESS(f'** Word document report saved to {docx_output}'))
                
            # Generate PDF by converting the DOCX file
            if generate_pdf:
                try:
                    self.stdout.write(f'Converting {docx_file_path} to {pdf_output}...')
                    if not os.path.exists(docx_file_path):
                        raise CommandError(f'DOCX file not found: {docx_file_path}')
                    
                    convert_docx_to_pdf_libreoffice(docx_file_path, pdf_output)
                    
                    if os.path.exists(pdf_output):
                        self.stdout.write(self.style.SUCCESS(f'** PDF report saved to {pdf_output}'))
                    else:
                        raise CommandError(f'PDF file was not created: {pdf_output}')
                    
                    # Clean up temporary DOCX file if it was created only for PDF
                    if temp_docx_for_pdf and os.path.exists(docx_file_path):
                        os.remove(docx_file_path)
                        
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error converting DOCX to PDF: {str(e)}'))
                    self.stdout.write(self.style.ERROR(f'Error type: {type(e).__name__}'))
                    # Clean up temporary file on error
                    if temp_docx_for_pdf and os.path.exists(docx_file_path):
                        os.remove(docx_file_path)
            
            # Display summary
            self.stdout.write(f'--------------------------------')
            date_range_str = f'from {start_date_str} to {end_date_str}'
            self.stdout.write(self.style.SUCCESS(
                f'Successfully exported {hours_entries.count()} volunteer hour entries for '
                f'{volunteer.first_name} '
            ))
            self.stdout.write(self.style.SUCCESS(f'Name: {volunteer.first_name} {volunteer.last_name}'))
            start_month, end_month = convert_datetime_to_month_year(start_date_str, end_date_str)
            self.stdout.write(self.style.SUCCESS(f'Volunteer Period: {start_month} to {end_month}'))
            self.stdout.write(self.style.SUCCESS(f'Total Hours: {total_hours}'))
            
        except Exception as e:
            raise CommandError(f'Error: {str(e)}')
