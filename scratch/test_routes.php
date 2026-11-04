<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'admin@bcmt.edu.pk')->first();
Illuminate\Support\Facades\Auth::login($user);

// 1. Test /admin/roll-numbers
try {
    $req1 = Illuminate\Http\Request::create('/admin/roll-numbers', 'GET');
    $req1->setUserResolver(fn() => $user);
    $res1 = $kernel->handle($req1);
    echo '/admin/roll-numbers status: ' . $res1->getStatusCode() . PHP_EOL;
    if ($res1->getStatusCode() >= 400) {
        echo substr($res1->getContent(), 0, 500) . PHP_EOL;
    }
} catch (\Throwable $e) {
    echo '/admin/roll-numbers error: ' . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}

// 2. Test /hod/exams
try {
    $req2 = Illuminate\Http\Request::create('/hod/exams', 'GET');
    $req2->setUserResolver(fn() => $user);
    $res2 = $kernel->handle($req2);
    echo '/hod/exams status: ' . $res2->getStatusCode() . PHP_EOL;
    if ($res2->getStatusCode() >= 400) {
        echo substr($res2->getContent(), 0, 500) . PHP_EOL;
    }
} catch (\Throwable $e) {
    echo '/hod/exams error: ' . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
