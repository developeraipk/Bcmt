<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AdminRoutesAccessTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_access_roll_numbers_and_exams_pages()
    {
        $admin = User::first();
        $this->assertNotNull($admin);

        $res1 = $this->actingAs($admin)->get('/admin/roll-numbers');
        $res1->assertOk();

        $res2 = $this->actingAs($admin)->get('/hod/exams');
        $res2->assertOk();
    }
}
