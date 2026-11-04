<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('session_program_id')->nullable()->constrained('session_programs')->cascadeOnDelete();
            $table->string('title');
            $table->string('exam_code', 30)->unique();
            $table->unsignedSmallInteger('duration_minutes')->default(60);
            $table->unsignedSmallInteger('total_questions')->default(50);
            $table->decimal('total_marks', 6, 2)->default(100.00);
            $table->decimal('passing_marks', 6, 2)->default(50.00);
            $table->decimal('passing_percentage', 5, 2)->default(50.00);
            $table->decimal('negative_marks_per_wrong', 4, 2)->default(0.00);
            $table->boolean('randomize_questions')->default(true);
            $table->boolean('randomize_options')->default(true);
            
            // Mandatory Campus Invigilator Attendance by default (Mandatory Correction 4)
            $table->boolean('requires_attendance')->default(true);

            $table->enum('status', ['draft', 'scheduled', 'active', 'completed', 'closed'])->default('draft')->index();
            $table->timestamp('scheduled_start')->nullable();
            $table->timestamp('scheduled_end')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Test-Wise Common PIN (One Common PIN per Examination, Hashed with Argon2id + Pepper)
        Schema::create('examination_pins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->string('pin_hash', 255); // Argon2id hash with secret pepper (Mandatory Correction 1)
            $table->boolean('is_active')->default(true)->index();
            $table->foreignId('generated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('change_reason')->nullable();
            $table->timestamps();
        });

        // Short-Lived Access Tokens to separate PIN verification from Attempt Start (Mandatory Correction 3)
        Schema::create('examination_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->boolean('is_consumed')->default(false);
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete();
            $table->string('subject'); // Biology, Chemistry, Physics, English, Medical Technology
            $table->string('topic')->nullable();
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->decimal('marks', 4, 2)->default(1.00);
            $table->text('question_text');
            $table->text('explanation')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('option_label', 5); // A, B, C, D
            $table->text('option_text');
            $table->boolean('is_correct')->default(false); // Strictly hidden from frontend props during exam!
            $table->timestamps();
        });

        // Frozen Question Snapshot mapping for Examination immutability (Mandatory Correction 6 & 9)
        Schema::create('examination_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->json('snapshot_payload')->nullable(); // Complete immutable copy of question & options
            $table->timestamps();

            $table->unique(['examination_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examination_questions');
        Schema::dropIfExists('question_options');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('examination_access_tokens');
        Schema::dropIfExists('examination_pins');
        Schema::dropIfExists('examinations');
    }
};
