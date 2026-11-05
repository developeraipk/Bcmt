<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admission_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('admission_sessions', 'closing_time')) {
                $table->string('closing_time', 10)->default('23:59')->after('closing_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admission_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('admission_sessions', 'closing_time')) {
                $table->dropColumn('closing_time');
            }
        });
    }
};
