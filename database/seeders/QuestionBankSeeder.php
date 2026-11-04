<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Database\Seeder;

class QuestionBankSeeder extends Seeder
{
    /**
     * Authentic Medical Technology Curriculum Questions for Admission Test Testing
     */
    public function run(): void
    {
        $questions = [
            // BIOLOGY
            [
                'subject' => 'Biology',
                'topic' => 'Cell Biology & Cytology',
                'difficulty' => 'easy',
                'marks' => 1.00,
                'text' => 'Which organelle is known as the powerhouse of eukaryotic cells?',
                'options' => [
                    ['label' => 'A', 'text' => 'Mitochondria', 'is_correct' => true],
                    ['label' => 'B', 'text' => 'Ribosome', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'Endoplasmic Reticulum', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Golgi Apparatus', 'is_correct' => false],
                ],
                'explanation' => 'Mitochondria produce ATP through cellular aerobic respiration.',
            ],
            [
                'subject' => 'Biology',
                'topic' => 'Hematology & Physiology',
                'difficulty' => 'medium',
                'marks' => 1.00,
                'text' => 'Which blood cells lack a nucleus at mature functional stage in humans?',
                'options' => [
                    ['label' => 'A', 'text' => 'Monocytes', 'is_correct' => false],
                    ['label' => 'B', 'text' => 'Erythrocytes (Red Blood Cells)', 'is_correct' => true],
                    ['label' => 'C', 'text' => 'Neutrophils', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Lymphocytes', 'is_correct' => false],
                ],
                'explanation' => 'Mature human erythrocytes enucleate to maximize oxygen-carrying hemoglobin volume.',
            ],
            [
                'subject' => 'Biology',
                'topic' => 'Immunology',
                'difficulty' => 'medium',
                'marks' => 1.00,
                'text' => 'Which class of immunoglobulins can cross the human placental barrier?',
                'options' => [
                    ['label' => 'A', 'text' => 'IgA', 'is_correct' => false],
                    ['label' => 'B', 'text' => 'IgM', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'IgG', 'is_correct' => true],
                    ['label' => 'D', 'text' => 'IgE', 'is_correct' => false],
                ],
                'explanation' => 'IgG is the only antibody capable of crossing the placenta to provide passive immunity.',
            ],

            // CHEMISTRY
            [
                'subject' => 'Chemistry',
                'topic' => 'Biochemistry & Acids/Bases',
                'difficulty' => 'easy',
                'marks' => 1.00,
                'text' => 'What is the normal physiological pH range of arterial human blood?',
                'options' => [
                    ['label' => 'A', 'text' => '7.35 – 7.45', 'is_correct' => true],
                    ['label' => 'B', 'text' => '6.80 – 7.10', 'is_correct' => false],
                    ['label' => 'C', 'text' => '7.80 – 8.10', 'is_correct' => false],
                    ['label' => 'D', 'text' => '7.00 – 7.20', 'is_correct' => false],
                ],
                'explanation' => 'Normal physiological arterial blood pH is tightly regulated between 7.35 and 7.45.',
            ],
            [
                'subject' => 'Chemistry',
                'topic' => 'Chemical Solutions & Laboratory',
                'difficulty' => 'medium',
                'marks' => 1.00,
                'text' => 'A 0.9% w/v sodium chloride (NaCl) aqueous solution is clinically referred to as:',
                'options' => [
                    ['label' => 'A', 'text' => 'Hypertonic Saline', 'is_correct' => false],
                    ['label' => 'B', 'text' => 'Normal Saline (Isotonic)', 'is_correct' => true],
                    ['label' => 'C', 'text' => 'Hypotonic Saline', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Buffered Saline', 'is_correct' => false],
                ],
                'explanation' => '0.9% NaCl has an osmolarity matching normal human blood plasma (approx 308 mOsm/L).',
            ],

            // PHYSICS
            [
                'subject' => 'Physics',
                'topic' => 'Fluid Dynamics & Pressure',
                'difficulty' => 'medium',
                'marks' => 1.00,
                'text' => 'The SI unit of pressure used in hemodynamic and atmospheric measurements is:',
                'options' => [
                    ['label' => 'A', 'text' => 'Pascal (Pa)', 'is_correct' => true],
                    ['label' => 'B', 'text' => 'Joule (J)', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'Newton (N)', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Watt (W)', 'is_correct' => false],
                ],
                'explanation' => 'One Pascal is equal to one Newton per square meter (1 N/m²).',
            ],
            [
                'subject' => 'Physics',
                'topic' => 'Radiation & Optics',
                'difficulty' => 'easy',
                'marks' => 1.00,
                'text' => 'X-rays used in medical diagnostic radiology belong to which part of the spectrum?',
                'options' => [
                    ['label' => 'A', 'text' => 'Electromagnetic Radiation', 'is_correct' => true],
                    ['label' => 'B', 'text' => 'Acoustic Sound Waves', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'Mechanical Waves', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Infrared Radiation', 'is_correct' => false],
                ],
                'explanation' => 'X-rays are high-frequency, high-energy electromagnetic waves.',
            ],

            // ENGLISH & GENERAL MEDICAL KNOWLEDGE
            [
                'subject' => 'English',
                'topic' => 'Medical Terminology',
                'difficulty' => 'easy',
                'marks' => 1.00,
                'text' => 'The medical prefix "Hepat-" denotes which vital human organ?',
                'options' => [
                    ['label' => 'A', 'text' => 'Liver', 'is_correct' => true],
                    ['label' => 'B', 'text' => 'Kidney', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'Heart', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Brain', 'is_correct' => false],
                ],
                'explanation' => 'Hepat- is derived from Greek hepatos, referring to the liver (e.g. hepatitis).',
            ],
            [
                'subject' => 'General Medical',
                'topic' => 'Aseptic Technique & Safety',
                'difficulty' => 'easy',
                'marks' => 1.00,
                'text' => 'The complete destruction of all forms of microbial life including bacterial spores is:',
                'options' => [
                    ['label' => 'A', 'text' => 'Sterilization', 'is_correct' => true],
                    ['label' => 'B', 'text' => 'Disinfection', 'is_correct' => false],
                    ['label' => 'C', 'text' => 'Antisepsis', 'is_correct' => false],
                    ['label' => 'D', 'text' => 'Sanitization', 'is_correct' => false],
                ],
                'explanation' => 'Sterilization eliminates all microorganisms, typically achieved via autoclaving.',
            ],
        ];

        foreach ($questions as $q) {
            $question = Question::create([
                'subject' => $q['subject'],
                'topic' => $q['topic'],
                'difficulty' => $q['difficulty'],
                'marks' => $q['marks'],
                'question_text' => $q['text'],
                'explanation' => $q['explanation'],
                'is_active' => true,
            ]);

            foreach ($q['options'] as $opt) {
                QuestionOption::create([
                    'question_id' => $question->id,
                    'option_label' => $opt['label'],
                    'option_text' => $opt['text'],
                    'is_correct' => $opt['is_correct'],
                ]);
            }
        }
    }
}
