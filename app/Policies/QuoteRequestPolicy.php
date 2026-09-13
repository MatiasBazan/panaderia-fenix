<?php

namespace App\Policies;

use App\Models\QuoteRequest;
use App\Models\User;

class QuoteRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, QuoteRequest $quoteRequest): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, QuoteRequest $quoteRequest): bool
    {
        return $user->isAdmin();
    }

    /** Borrado definitivo, junto con su cotización: pensado para solicitudes de prueba o spam. */
    public function delete(User $user, QuoteRequest $quoteRequest): bool
    {
        return $user->isAdmin();
    }

    /** Una solicitud tiene una sola cotización: si ya existe, se edita esa. */
    public function generateQuote(User $user, QuoteRequest $quoteRequest): bool
    {
        return $user->isAdmin() && $quoteRequest->quote === null;
    }
}
