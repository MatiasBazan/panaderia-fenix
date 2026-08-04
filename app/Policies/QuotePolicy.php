<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Quote $quote): bool
    {
        return $user->isAdmin();
    }

    /** Sólo el borrador se toca. Lo que ya salió por mail queda como salió. */
    public function update(User $user, Quote $quote): bool
    {
        return $user->isAdmin() && $quote->estado->esEditable();
    }

    /** Se envía una sola vez, y con al menos un ítem cargado. */
    public function send(User $user, Quote $quote): bool
    {
        return $user->isAdmin()
            && $quote->estado->esEditable()
            && $quote->items()->count() > 0;
    }

    public function downloadPdf(User $user, Quote $quote): bool
    {
        return $user->isAdmin();
    }
}
