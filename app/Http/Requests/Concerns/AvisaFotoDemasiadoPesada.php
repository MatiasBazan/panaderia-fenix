<?php

namespace App\Http\Requests\Concerns;

use App\Support\LimiteSubida;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Validator;

/**
 * Traduce «PHP descartó el archivo por tamaño» a un mensaje que se entiende.
 *
 * Cuando la foto supera `upload_max_filesize`, PHP no la entrega: llega un
 * archivo vacío con código de error. Sin esto, un campo obligatorio contesta
 * «tiene que ser una imagen» y uno opcional guarda en silencio, sin foto y sin
 * avisar. Las dos salidas mandan al admin a buscar el problema en la foto, que
 * está bien; el problema es el techo del servidor.
 */
trait AvisaFotoDemasiadoPesada
{
    /** Los KB que la app pide para esta foto, antes del techo de PHP. */
    abstract protected static function pesoPedidoKb(): int;

    protected function avisarSiLaFotoNoEntro(Validator $validator, string $campo = 'imagen'): void
    {
        $archivo = $this->file($campo);

        if (! $archivo instanceof UploadedFile) {
            return;
        }

        if (! in_array($archivo->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
            return;
        }

        $validator->errors()->forget($campo);
        $validator->errors()->add(
            $campo,
            'La foto pesa más de los '.LimiteSubida::texto(static::pesoPedidoKb()).
            ' MB que acepta el servidor. Probá con una más liviana.',
        );
    }
}
