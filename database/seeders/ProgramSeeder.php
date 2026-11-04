<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            // A. BS Degree Programs (4 Years, Intermediate Pass, Affiliated with KMU)
            [
                'name' => 'BS Emergency Care Technology (ECT)',
                'code' => 'BSECT',
                'category' => 'bs_degree',
                'duration_years' => 4,
                'qualification_required' => 'Intermediate Pass',
                'affiliation' => 'Khyber Medical University (KMU)',
                'description' => 'Four-year degree program in Emergency Care and Health Technology affiliated with Khyber Medical University (KMU).',
                'is_active' => true,
            ],
            [
                'name' => 'BS Medical Laboratory Technology (MLT)',
                'code' => 'BSMLT',
                'category' => 'bs_degree',
                'duration_years' => 4,
                'qualification_required' => 'Intermediate Pass',
                'affiliation' => 'Khyber Medical University (KMU)',
                'description' => 'Four-year degree program in Medical Laboratory Technology affiliated with Khyber Medical University (KMU).',
                'is_active' => true,
            ],

            // B. Pharmacy Category B Diploma (2 Years, Matric Pass, Affiliated with Pharmacy Council of Pakistan)
            [
                'name' => 'Pharmacy Category B',
                'code' => 'PCB',
                'category' => 'pharmacy_b',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'Pharmacy Council of Pakistan',
                'description' => 'Two-year pharmacy diploma program accredited by the Pharmacy Council of Pakistan.',
                'is_active' => true,
            ],

            // C. Medical Technology Diplomas (2 Years, Matric Pass, Affiliated with KPK Medical Faculty)
            [
                'name' => 'Health Technology',
                'code' => 'HT',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year diploma program in Health Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.',
                'is_active' => true,
            ],
            [
                'name' => 'Pathology',
                'code' => 'PATH',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year diploma program in Pathology Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.',
                'is_active' => true,
            ],
            [
                'name' => 'Surgical',
                'code' => 'SURG',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year diploma program in Surgical & Operation Theater Technology affiliated with KPK Medical Faculty.',
                'is_active' => true,
            ],
            [
                'name' => 'Anaesthesia',
                'code' => 'ANES',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year diploma program in Anaesthesia Technology affiliated with Khyber Pakhtunkhwa Medical Faculty.',
                'is_active' => true,
            ],
            [
                'name' => 'Pharmacy Diploma',
                'code' => 'PHARMA',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year pharmacy technician diploma program affiliated with Khyber Pakhtunkhwa Medical Faculty.',
                'is_active' => true,
            ],
            [
                'name' => 'Radiology',
                'code' => 'RADIO',
                'category' => 'medical_diploma',
                'duration_years' => 2,
                'qualification_required' => 'Matric Pass',
                'affiliation' => 'KPK Medical Faculty (FPAHS)',
                'description' => 'Two-year diploma program in Radiology & Medical Imaging Technology affiliated with KPK Medical Faculty.',
                'is_active' => true,
            ],
        ];

        foreach ($programs as $prog) {
            Program::updateOrCreate(['code' => $prog['code']], $prog);
        }
    }
}
