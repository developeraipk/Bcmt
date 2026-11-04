<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to add optimized scaling indexes.
     */
    public function up(): void
    {
        // 1. Applications table indexes
        Schema::table('applications', function (Blueprint $table) {
            $table->index(['session_program_id', 'exam_eligibility_status'], 'idx_apps_prog_eligibility');
            $table->index(['exam_eligibility_status', 'roll_number'], 'idx_apps_eligibility_roll');
        });

        // 2. Applicant profiles search indexes
        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->index('full_name', 'idx_profiles_full_name');
            $table->index('father_name', 'idx_profiles_father_name');
            $table->index('cnic', 'idx_profiles_cnic');
            $table->index('mobile_number', 'idx_profiles_mobile');
        });

        // 3. Examination attendances
        Schema::table('examination_attendances', function (Blueprint $table) {
            $table->index(['examination_id', 'attendance_status'], 'idx_attendance_exam_status');
        });

        // 4. Examination attempts
        Schema::table('examination_attempts', function (Blueprint $table) {
            $table->index(['examination_id', 'status'], 'idx_attempts_exam_status');
        });

        // 5. Examination results
        Schema::table('examination_results', function (Blueprint $table) {
            $table->index(['examination_id', 'obtained_marks'], 'idx_results_exam_marks');
        });

        // 6. Seat allocations
        Schema::table('seat_allocations', function (Blueprint $table) {
            $table->index(['session_program_id', 'status'], 'idx_seats_program_status');
        });

        // 7. Merit list items
        Schema::table('merit_list_items', function (Blueprint $table) {
            $table->index(['merit_list_id', 'rank'], 'idx_merit_list_rank');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex('idx_apps_prog_eligibility');
            $table->dropIndex('idx_apps_eligibility_roll');
        });

        Schema::table('applicant_profiles', function (Blueprint $table) {
            $table->dropIndex('idx_profiles_full_name');
            $table->dropIndex('idx_profiles_father_name');
            $table->dropIndex('idx_profiles_cnic');
            $table->dropIndex('idx_profiles_mobile');
        });

        Schema::table('examination_attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendance_exam_status');
        });

        Schema::table('examination_attempts', function (Blueprint $table) {
            $table->dropIndex('idx_attempts_exam_status');
        });

        Schema::table('examination_results', function (Blueprint $table) {
            $table->dropIndex('idx_results_exam_marks');
        });

        Schema::table('seat_allocations', function (Blueprint $table) {
            $table->dropIndex('idx_seats_program_status');
        });

        Schema::table('merit_list_items', function (Blueprint $table) {
            $table->dropIndex('idx_merit_list_rank');
        });
    }
};
