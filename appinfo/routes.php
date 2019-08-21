<?php
//declare(strict_types=1);
//
//namespace OCA\Files_MindMap\AppInfo;

return ['routes' => [
    ['name' => 'display#showMindmapViewer', 'url' => '/', 'verb' => 'GET'],
    ['name' => 'FileHandling#save', 'url' => '/ajax/savefile', 'verb' => 'PUT'],
    ['name' => 'FileHandling#load', 'url' => '/ajax/loadfile', 'verb' => 'GET'],
    ['name' => 'PublicFileHandling#save', 'url' => '/share/save', 'verb' => 'PUT'],
    ['name' => 'PublicFileHandling#load', 'url' => '/public/{token}', 'verb' => 'GET'],
]];
