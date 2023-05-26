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
        $table->id();
        $table->string('author')->nullable()->default('Joe Johnson');

        $table->text('title')->nullable();
        $table->mediumText('desc')->nullable();

        $table->float('length')->nullable();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
