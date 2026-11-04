<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'college_name' => 'Bannu College of Medical Technologies',
            'college_short_name' => 'BCMT',
            'tagline' => 'The Home of Quality Education',
            'campus_address' => 'Circular Road near Hira School, Sokari Gate, Bannu, Khyber Pakhtunkhwa',
            'official_phone' => '0928-622699',
            'official_mobile' => '0334-0580180',
            'official_email' => 'bcmts1122@gmail.com',
            'official_website' => 'https://bcmtkpk.wordpress.com',
            
            // Dynamic WhatsApp Integration (Mandatory Technical Revision 9)
            'whatsapp_community_enabled' => '1',
            'whatsapp_community_url' => 'https://chat.whatsapp.com/invite/BCMTAdmission2026',
            'whatsapp_support_enabled' => '1',
            'whatsapp_support_phone' => '923340580180',
            'whatsapp_support_message' => 'Hello BCMT Admission Support, I have an inquiry regarding admission applications.',
            
            // Admission Status & Notices
            'admission_open_status' => '1',
            'admission_closed_notice' => 'Online admissions for the current session are currently closed. Please contact the admission office for announcements.',
            
            // Exam Campus Settings
            'exam_instructions' => '1. Report to the assigned exam room 30 minutes before test commencement.\n2. Present your original CNIC/B-Form and printed BCMT Roll Number Slip.\n3. The room invigilator will verify your attendance.\n4. Enter the test-wise Common PIN announced by the invigilator.\n5. You will have 60 minutes to complete the test.',
        ];

        foreach ($settings as $key => $val) {
            SystemSetting::set($key, $val, 'general');
        }
    }
}
