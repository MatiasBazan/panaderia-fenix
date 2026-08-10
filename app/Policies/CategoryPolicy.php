<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

/**
 * El catálogo lo maneja sólo la panadería desde el admin.
 */
class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }

    /** Una categoría con productos no se borra: se desactiva. */
    public function delete(User $user, Category $category): bool
    {
        return $user->isAdmin() && $category->products()->count() === 0;
    }
}
