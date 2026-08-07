<?php

namespace App\Http\Controllers\Kabaya\Mobile\App\Services;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SBController extends Controller
{
    public function getFolder(Request $request)
    {
        $accessToken = $this->token();
        $folderId = config('services.google.folder_id');

        $pageToken = $request->nextPageToken;
        $search = $request->search;

        $queryConditions = [
            sprintf("'%s' in parents", $folderId),
            "mimeType = 'application/vnd.google-apps.folder'",
            "trashed = false",
        ];

        if (!empty($search)) {
            $sanitizedSearch = str_replace("'", "\\'", $search);
            $queryConditions[] = sprintf("name contains '%s'", $sanitizedSearch);
        }

        $query = implode(' and ', $queryConditions);

        $queryParams = [
            'q' => $query,
            'fields' => 'nextPageToken, files(id, name)',
            'pageSize' => 10,
        ];

        if ($pageToken) {
            $queryParams['pageToken'] = $pageToken;
        }

        $response = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/drive/v3/files', $queryParams);

        if (!$response->successful()) {
            throw new \Exception('Failed to get folders: ' . $response->body());
        }

        return [
            'files' => $response->json('files', []),
            'nextPageToken' => $response->json('nextPageToken', null),
        ];
    }

    public function getPdf(Request $request, $id)
    {
        $accessToken = $this->token();

        $pageToken = $request->nextPageToken;
        $search = $request->search;

        $queryConditions = [
            sprintf("'%s' in parents", $id),
            "mimeType = 'application/pdf'",
            "trashed = false",
        ];

        if (!empty($search)) {
            $sanitizedSearch = str_replace("'", "\\'", $search);
            $queryConditions[] = sprintf("name contains '%s'", $sanitizedSearch);
        }

        $query = implode(' and ', $queryConditions);

        $queryParams = [
            'q' => $query,
            'fields' => 'nextPageToken, files(id, name)',
            'pageSize' => 10,
        ];

        if ($pageToken) {
            $queryParams['pageToken'] = $pageToken;
        }

        $response = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/drive/v3/files', $queryParams);

        if (!$response->successful()) {
            throw new \Exception('Failed to get pdfs: ' . $response->body());
        }

        return [
            'files' => $response->json('files', []),
            'nextPageToken' => $response->json('nextPageToken', null),
        ];
    }

    public function previewPdf($id)
    {
        $accessToken = $this->token();

        $response = Http::withToken($accessToken)->post(
            "https://www.googleapis.com/drive/v3/files/{$id}/permissions",
            [
                'role' => 'reader',
                'type' => 'anyone',
            ]
        );

        if (!$response->successful()) {
            throw new \Exception('Failed to preview pdf: ' . $response->body());
        }

        return response()->json([
            'previewLink' => "https://drive.google.com/file/d/{$id}/preview"
        ]);
    }
}
