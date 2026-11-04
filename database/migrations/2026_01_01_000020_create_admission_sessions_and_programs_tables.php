<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique(); // e.g. 2026-2027
            $table->date('start_date');
            $table->date('closing_date');
            $table->enum('status', ['draft', 'open', 'closed', 'archived'])->default('draft');
            $table->boolean('is_active')->default(false)->index();
            $table->text('admission_instructions')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique(); // BSECT, BSMLT, PCB, HT, PATH, SURG, ANES, PHARMA, RADIO
            $table->enum('category', ['bs_degree', 'pharmacy_b', 'medical_diploma']);
            $table->unsignedSmallInteger('duration_years'); // 4 for BS, 2 for Diploma
            $table->string('qualification_required'); // "Intermediate Pass", "Matric Pass"
            $table->string('affiliation'); // KMU, Pharmacy Council, KPK Medical Faculty
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('session_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_session_id')->constrained('admission_sessions')->cascadeOnDelete();
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
            $table->unsignedInteger('total_seats'); // e.g. 20, 30, 100
            $table->unsignedInteger('seats_allocated')->default(0);
            $table->boolean('is_open')->default(true);
            $table->boolean('test_required')->default(true);
            $table->decimal('application_fee', 10, 2)->default(0.00);
            $table->unsignedSmallInteger('reservation_validity_days')->default(5);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['admission_session_id', 'program_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_programs');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('admission_sessions');
    }
};
