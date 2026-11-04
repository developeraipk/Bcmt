<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Campus Invigilation Attendance Roster (Mandatory Correction 4)
        Schema::create('examination_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('invigilator_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('room_number', 50);
            $table->string('seat_number', 50)->nullable();
            $table->enum('attendance_status', ['present', 'absent', 'disqualified'])->default('present');
            $table->timestamp('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['examination_id', 'application_id']);
        });

        Schema::create('examination_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            
            // Server-Authoritative Timer (Calculated strictly on the server)
            $table->timestamp('start_time')->nullable();
            $table->timestamp('server_deadline')->nullable();
            $table->timestamp('end_time')->nullable();

            $table->enum('status', ['in_progress', 'submitted', 'timed_out', 'cancelled'])->default('in_progress')->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('event_logs')->nullable(); // Tab switches, heartbeats, network pings
            $table->timestamps();
        });

        Schema::create('attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_attempt_id')->constrained('examination_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->nullOnDelete();
            $table->boolean('is_correct')->default(false);
            $table->decimal('marks_awarded', 5, 2)->default(0.00);
            $table->unsignedInteger('time_spent_seconds')->default(0);
            $table->boolean('is_flagged')->default(false);
            $table->timestamps();

            $table->unique(['examination_attempt_id', 'question_id']);
        });

        Schema::create('examination_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_attempt_id')->unique()->constrained('examination_attempts')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            
            $table->unsignedSmallInteger('total_questions');
            $table->unsignedSmallInteger('correct_answers');
            $table->unsignedSmallInteger('incorrect_answers');
            $table->unsignedSmallInteger('unanswered');
            $table->decimal('total_marks', 6, 2);
            $table->decimal('obtained_marks', 6, 2);
            $table->decimal('percentage', 5, 2);
            $table->boolean('is_passed')->default(false);

            // Results remain hidden from students until authorized publication
            $table->enum('status', ['calculated', 'under_review', 'published'])->default('calculated')->index();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Audit Log for any Score Adjustments (Mandatory Correction 6)
        Schema::create('result_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examination_result_id')->constrained('examination_results')->cascadeOnDelete();
            $table->foreignId('adjusted_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('hod_approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('previous_marks', 6, 2);
            $table->decimal('new_marks', 6, 2);
            $table->text('reason');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_adjustments');
        Schema::dropIfExists('examination_results');
        Schema::dropIfExists('attempt_answers');
        Schema::dropIfExists('examination_attempts');
        Schema::dropIfExists('examination_attendances');
    }
};
