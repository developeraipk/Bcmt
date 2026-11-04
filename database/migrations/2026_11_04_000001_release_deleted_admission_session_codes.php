<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $trashed = DB::table('admission_sessions')
            ->whereNotNull('deleted_at')
            ->where('code', 'not like', '%_d_%')
            ->get();

        foreach ($trashed as $session) {
            $prefix = substr($session->code, 0, 12);
            DB::table('admission_sessions')
                ->where('id', $session->id)
                ->update(['code' => $prefix . '_d_' . $session->id]);
        }
    }

    public function down(): void
    {
        // Irreversible release of unique code on deleted sessions
    }
};
