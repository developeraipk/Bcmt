<?php

namespace App\Http\Controllers;

use App\Models\ApplicationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentStreamController extends Controller
{
    /**
     * Stream private candidate documents securely with authorization
     */
    public function stream(Request $request, int $documentId)
    {
        $user = $request->user();
        $document = ApplicationDocument::with('application')->findOrFail($documentId);

        // Authorization: Must be document owner (student) or staff with permission
        $isOwner = $document->application->user_id === $user->id;
        $isStaff = $user->hasRole(['super_admin', 'management', 'hod', 'admission_officer', 'document_verifier', 'invigilator']);

        if (!$isOwner && !$isStaff) {
            abort(403, 'Unauthorized access to confidential candidate document.');
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'Document file not found on secure storage.');
        }

        return Storage::disk('local')->response(
            $document->file_path,
            $document->original_filename,
            [
                'Content-Type' => $document->mime_type,
                'Cache-Control' => 'no-cache, private, must-revalidate',
                'Pragma' => 'no-cache',
            ]
        );
    }
}
