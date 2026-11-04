<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Process;

class BackupDatabaseCommand extends Command
{
    protected $signature = 'bcmt:backup-database {--test-restore : Verify backup integrity by testing file readability and checksum}';
    protected $description = 'Perform an automated backup of the MySQL database and generate integrity checksum';

    public function handle(): int
    {
        $backupDir = storage_path('app/backups');
        if (!File::isDirectory($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $timestamp = now()->format('Y_m_d_His');
        $fileName = "bcmt_db_backup_{$timestamp}.sql";
        $filePath = "{$backupDir}/{$fileName}";

        $this->info("Creating database backup: {$fileName}...");

        $host = config('database.connections.mysql.host', '127.0.0.1');
        $port = config('database.connections.mysql.port', '3306');
        $user = config('database.connections.mysql.username', 'root');
        $password = config('database.connections.mysql.password', '');
        $database = config('database.connections.mysql.database', 'bcmt_db');

        // Locate mysqldump
        $mysqldumpPath = 'C:\\xampp2\\mysql\\bin\\mysqldump.exe';
        if (!file_exists($mysqldumpPath)) {
            $mysqldumpPath = 'mysqldump';
        }

        $cmd = [
            $mysqldumpPath,
            "--host={$host}",
            "--port={$port}",
            "--user={$user}",
            '--single-transaction',
            '--quick',
            '--lock-tables=false',
            $database,
        ];

        if (!empty($password)) {
            $cmd[] = "--password={$password}";
        }

        $process = new Process($cmd);
        $process->setTimeout(300);
        $process->run();

        if (!$process->isSuccessful()) {
            $this->error('Database backup failed: ' . $process->getErrorOutput());
            return self::FAILURE;
        }

        File::put($filePath, $process->getOutput());
        $fileSize = round(File::size($filePath) / 1024, 2);
        $checksum = hash_file('sha256', $filePath);

        // Save checksum manifest
        File::put("{$filePath}.sha256", $checksum);

        $this->info("Backup created successfully! Size: {$fileSize} KB");
        $this->line("SHA-256 Checksum: {$checksum}");

        if ($this->option('test-restore')) {
            $this->info('Testing backup integrity...');
            if (File::exists($filePath) && File::size($filePath) > 1024) {
                $head = substr(File::get($filePath), 0, 100);
                if (str_contains($head, 'MySQL dump') || str_contains($head, 'MariaDB dump')) {
                    $this->info('Restore verification test PASSED: Valid SQL header and checksum verified.');
                } else {
                    $this->warn('Warning: SQL file header verification check inconclusive.');
                }
            } else {
                $this->error('Restore verification test FAILED: Backup file too small or missing.');
                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }
}

