<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number', 30)->unique(); // e.g. BCMT-2026-000001
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('session_program_id')->constrained('session_programs')->cascadeOnDelete();
            $table->string('roll_number', 40)->nullable()->unique(); // e.g. BCMT-2026-ECT-0001
            
            // Normalized CNIC (13 digits without dashes) for strict unique enforcement per session
            $table->string('normalized_cnic', 13)->index();

            // Secondary identity fingerprint hash for administrative review
            $table->string('identity_hash', 64)->nullable()->index();
            $table->boolean('potential_duplicate_detected')->default(false)->index();
            $table->text('duplicate_risk_notes')->nullable();

            // Independent Workflow States (Mandatory Correction 7)
            $table->enum('status', ['submitted', 'processing', 'completed', 'withdrawn', 'rejected'])->default('submitted')->index();
            $table->enum('verification_status', ['pending', 'under_review', 'correction_required', 'verified', 'rejected'])->default('pending')->index();
            $table->enum('exam_eligibility_status', ['locked', 'eligible', 'not_eligible', 'exempted'])->default('locked')->index();
            $table->enum('exam_attempt_status', ['not_started', 'pin_verified', 'in_progress', 'completed', 'absent', 'disqualified'])->default('not_started')->index();
            $table->enum('result_status', ['pending', 'calculated', 'published'])->default('pending')->index();
            $table->enum('merit_status', ['pending', 'compiled', 'published'])->default('pending')->index();
            $table->enum('selection_status', ['unprocessed', 'selected', 'waiting_list', 'not_selected', 'seat_offered', 'admission_confirmed', 'offer_lapsed', 'declined'])->default('unprocessed')->index();

            $table->text('internal_remarks')->nullable();
            $table->text('correction_notes')->nullable();

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Strict Business Rule: One student can submit only ONE application per admission session
            $table->unique(['admission_session_id', 'normalized_cnic'], 'unique_session_cnic');
            $table->unique(['admission_session_id', 'user_id'], 'unique_session_user');
        });

        Schema::create('applicant_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->unique()->constrained('applications')->cascadeOnDelete();
            $table->string('full_name');
            $table->string('father_name');
            $table->date('dob');
            $table->enum('gender', ['male', 'female']); // Combined competition across program seats
            $table->string('cnic', 20); // Formatted with dashes
            $table->string('mobile_number', 25);
            $table->string('whatsapp_number', 25);
            $table->string('email');
            $table->string('nationality')->default('Pakistani');
            $table->string('domicile_district');
            $table->text('permanent_address');
            $table->text('current_address');
            $table->timestamps();
        });

        Schema::create('academic_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->enum('level', ['matric', 'intermediate', 'other']);
            $table->string('qualification_name'); // e.g. Matric Science, FSc Pre-Medical
            $table->string('board_university'); // e.g. BISE Bannu
            $table->string('roll_number', 40);
            $table->unsignedSmallInteger('passing_year');
            $table->decimal('total_marks', 6, 2);
            $table->decimal('obtained_marks', 6, 2);
            $table->decimal('percentage', 5, 2);
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->enum('document_type', [
                'photo',
                'cnic_front',
                'cnic_back',
                'father_cnic',
                'matric_dmc',
                'inter_dmc',
                'domicile',
                'fee_slip',
                'other'
            ]);
            $table->string('file_path');
            $table->string('original_filename');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type', 100);
            $table->enum('verification_status', ['pending', 'approved', 'rejected', 'reupload_required'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('application_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('workflow_stage'); // e.g. verification, eligibility, selection
            $table->string('from_status');
            $table->string('to_status');
            $table->text('reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_histories');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('academic_records');
        Schema::dropIfExists('applicant_profiles');
        Schema::dropIfExists('applications');
    }
};
