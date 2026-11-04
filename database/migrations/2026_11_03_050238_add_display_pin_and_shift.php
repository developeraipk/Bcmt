<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('examination_pins') && !Schema::hasColumn('examination_pins', 'display_pin')) {
            Schema::table('examination_pins', function (Blueprint $table) {
                $table->string('display_pin', 30)->nullable()->after('pin_hash');
            });
        }

        if (Schema::hasTable('examinations') && !Schema::hasColumn('examinations', 'shift')) {
            Schema::table('examinations', function (Blueprint $table) {
                $table->string('shift', 30)->default('Morning')->after('exam_code');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('examination_pins') && Schema::hasColumn('examination_pins', 'display_pin')) {
            Schema::table('examination_pins', function (Blueprint $table) {
                $table->dropColumn('display_pin');
            });
        }

        if (Schema::hasTable('examinations') && Schema::hasColumn('examinations', 'shift')) {
            Schema::table('examinations', function (Blueprint $table) {
                $table->dropColumn('shift');
            });
        }
    }
};
