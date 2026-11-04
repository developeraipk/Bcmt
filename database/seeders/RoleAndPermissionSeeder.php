<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissionsByGroup = [
            'admission' => [
                'view_applications' => 'View Admission Applications',
                'verify_applications' => 'Verify Admission Applications and Documents',
                'manage_eligibility' => 'Mark Candidates Eligible for Test',
                'export_applications' => 'Export Application Reports and Lists',
            ],
            'programs' => [
                'manage_programs' => 'Create and Edit Academic Programs',
                'manage_sessions' => 'Configure Admission Sessions and Quotas',
            ],
            'examination' => [
                'manage_exams' => 'Create and Configure Examinations',
                'manage_pins' => 'Generate, Rotate and Manage Examination PINs',
                'manage_questions' => 'Create and Edit Question Bank Questions',
                'activate_exams' => 'Open and Close Active Examination Windows',
            ],
            'invigilation' => [
                'manage_attendance' => 'Verify Physical Candidate Campus Attendance',
                'monitor_exams' => 'Live Monitor Active Examination Rooms',
            ],
            'results_merit' => [
                'calculate_results' => 'Calculate Examination Results',
                'adjust_marks' => 'Make Audited Score Adjustments',
                'publish_results' => 'Formally Publish Examination Results',
                'configure_merit' => 'Define Dynamic Program Merit Formulas',
                'publish_merit' => 'Approve and Publish Program Merit Lists',
            ],
            'seat_allocation' => [
                'allocate_seats' => 'Reserve and Confirm Program Seats',
                'release_seats' => 'Release Expired Reservations and Promote Waiting List',
            ],
            'settings' => [
                'manage_settings' => 'Configure College Settings and WhatsApp Links',
                'view_audit_logs' => 'View System Security and Audit Logs',
            ],
        ];

        foreach ($permissionsByGroup as $group => $perms) {
            foreach ($perms as $name => $displayName) {
                Permission::firstOrCreate(['name' => $name], [
                    'group' => $group,
                    'display_name' => $displayName,
                ]);
            }
        }

        $roles = [
            'super_admin' => [
                'display' => 'Super Administrator',
                'desc' => 'Complete institutional access across all modules.',
                'permissions' => Permission::pluck('name')->toArray(),
            ],
            'management' => [
                'display' => 'Principal / College Management',
                'desc' => 'Executive dashboards, reports, and high-level approvals.',
                'permissions' => [
                    'view_applications', 'export_applications', 'manage_sessions',
                    'activate_exams', 'publish_results', 'publish_merit',
                    'allocate_seats', 'view_audit_logs',
                ],
            ],
            'hod' => [
                'display' => 'Head of Department (HOD)',
                'desc' => 'Academic programs, exam settings, question bank, passing criteria, and merit approval.',
                'permissions' => [
                    'view_applications', 'manage_exams', 'manage_pins', 'manage_questions',
                    'activate_exams', 'calculate_results', 'adjust_marks', 'publish_results',
                    'configure_merit', 'publish_merit',
                ],
            ],
            'admission_officer' => [
                'display' => 'Admission Officer',
                'desc' => 'Application processing, document verification, and seat allocation assistance.',
                'permissions' => [
                    'view_applications', 'verify_applications', 'manage_eligibility',
                    'export_applications', 'allocate_seats', 'release_seats',
                ],
            ],
            'document_verifier' => [
                'display' => 'Document Verifier',
                'desc' => 'Specialized document checking and correction requests.',
                'permissions' => [
                    'view_applications', 'verify_applications',
                ],
            ],
            'exam_manager' => [
                'display' => 'Examination Manager',
                'desc' => 'Question bank management, exam scheduling, and result preparation.',
                'permissions' => [
                    'manage_exams', 'manage_pins', 'manage_questions', 'activate_exams',
                    'calculate_results',
                ],
            ],
            'invigilator' => [
                'display' => 'Campus Invigilator',
                'desc' => 'Physical room supervision and candidate attendance verification.',
                'permissions' => [
                    'manage_attendance', 'monitor_exams',
                ],
            ],
            'student' => [
                'display' => 'Student / Applicant',
                'desc' => 'Personal application, documents, admit card, test taking, and scorecard.',
                'permissions' => [],
            ],
        ];

        foreach ($roles as $key => $roleData) {
            $role = Role::firstOrCreate(['name' => $key], [
                'display_name' => $roleData['display'],
                'description' => $roleData['desc'],
            ]);

            if (!empty($roleData['permissions'])) {
                $permIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id');
                $role->permissions()->sync($permIds);
            }
        }
    }
}
