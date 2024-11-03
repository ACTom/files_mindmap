<?php

declare(strict_types=1);

namespace OCA\Files_MindMap\Listener;

use OCA\Viewer\Event\LoadViewer;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

/** @template-implements IEventListener<Event|LoadViewer> */
class LoadViewerListener implements IEventListener {

	public function handle(Event $event): void {
		if (!$event instanceof LoadViewer) {
			return;
		}
		
		Util::addScript('files_mindmap', 'files_mindmap-mindmapviewer', 'viewer');
	}
}