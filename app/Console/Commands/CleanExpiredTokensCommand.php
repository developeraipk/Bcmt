<?php

namespace App\Console\Commands;

use App\Models\ExaminationAccessToken;
use Illuminate\Console\Command;

class CleanExpiredTokensCommand extends Command
{
    protected $signature = 'bcmt:clean-expired-tokens';
    protected $description = 'Purge expired examination access tokens';

    public function handle(): int
    {
        $deleted = ExaminationAccessToken::where('expires_at', '<', now()->subHours(6))->delete();
        $this->info("Purged {$deleted} stale examination access token(s).");
        return self::SUCCESS;
    }
}

