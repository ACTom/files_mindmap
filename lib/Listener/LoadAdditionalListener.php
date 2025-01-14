<?php

declare(strict_types=1);

namespace OCA\Files_MindMap\Listener;

use OCA\Files_MindMap\AppInfo\Application;
use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

class LoadAdditionalListener implements IEventListener {
	public function handle(Event $event): void {
		if (!($event instanceof LoadAdditionalScriptsEvent)) {
			return;
		}
		self::additionalScripts();
	}

	public static function additionalScripts() {
		Util::addStyle(Application::APPNAME, 'style');
//		Util::addScript(Application::APPNAME, 'files_mindmap-mindmap');
	}
}
