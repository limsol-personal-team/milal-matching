# Generated by Django 3.2.8 on 2023-12-04 03:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('records', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='volunteerhours',
            name='service_type',
            field=models.CharField(choices=[('saturday_agape', 'Saturday Agape'), ('orientation', 'Orientation'), ('backfill', 'Backfill'), ('other', 'Other')], help_text='Service type that hours were collected for', max_length=30),
        ),
    ]