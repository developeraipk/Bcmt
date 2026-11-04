<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dynamic Merit Formulas (Configurable per program & session - Mandatory Correction 2 & 5)
        Schema::create('merit_formulas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('session_program_id')->constrained('session_programs')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('version')->default(1);
            $table->decimal('total_weight', 5, 2)->default(100.00); // Must validate to 100.00%
            $table->json('tie_breaker_rules')->nullable(); // e.g. ["test_marks", "inter_percentage", "matric_percentage", "dob_seniority"]
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Fully Dynamic Components (e.g. Matric %, Inter %, Admission Test %, Interview %)
        Schema::create('merit_formula_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merit_formula_id')->constrained('merit_formulas')->cascadeOnDelete();
            $table->string('component_type'); // 'matric', 'intermediate', 'admission_test', 'interview', 'custom'
            $table->string('component_name'); // e.g. "Matriculation", "FSc Pre-Medical", "BCMT Admission Test"
            $table->decimal('weight_percentage', 5, 2); // e.g. 20.00, 30.00, 50.00
            $table->string('source_field')->nullable();
            $table->decimal('min_score_required', 5, 2)->nullable();
            $table->timestamps();
        });

        // Immutable Published Merit Lists (Mandatory Correction 6)
        Schema::create('merit_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('session_program_id')->constrained('session_programs')->cascadeOnDelete();
            $table->foreignId('merit_formula_id')->constrained('merit_formulas')->cascadeOnDelete();
            $table->string('title');
            $table->unsignedSmallInteger('version')->default(1);
            $table->enum('status', ['draft', 'under_review', 'approved', 'published_locked'])->default('draft')->index();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('published_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('integrity_hash', 64)->nullable(); // SHA-256 seal of published list
            $table->timestamps();
        });

        // Combined Ranking (Male and female candidates compete in ONE combined list)
        Schema::create('merit_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merit_list_id')->constrained('merit_lists')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->unsignedInteger('rank');
            $table->decimal('matric_percentage', 5, 2)->nullable();
            $table->decimal('inter_percentage', 5, 2)->nullable();
            $table->decimal('test_percentage', 5, 2)->nullable();
            $table->decimal('aggregate_percentage', 5, 2);
            $table->enum('status', ['selected', 'waiting_list', 'not_selected'])->default('selected')->index();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['merit_list_id', 'application_id']);
        });

        // Transactional Seat Allocation State Machine (Mandatory Correction 4, 5 & 7)
        Schema::create('seat_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('session_program_id')->constrained('session_programs')->cascadeOnDelete();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('merit_list_item_id')->nullable()->constrained('merit_list_items')->nullOnDelete();
            
            // Sequential physical seat slot (e.g. 1 to Total Seats)
            $table->unsignedInteger('seat_number');

            // Explicit allocation states: offered -> reserved -> confirmed -> released -> cancelled
            $table->enum('status', ['offered', 'reserved', 'confirmed', 'released', 'cancelled'])->default('offered')->index();
            
            $table->timestamp('offer_extended_at')->nullable();
            $table->timestamp('reservation_expires_at')->nullable(); // Configurable expiry
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('released_at')->nullable();
            $table->text('release_reason')->nullable();
            $table->foreignId('allocated_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_allocations');
        Schema::dropIfExists('merit_list_items');
        Schema::dropIfExists('merit_lists');
        Schema::dropIfExists('merit_formula_components');
        Schema::dropIfExists('merit_formulas');
    }
};
