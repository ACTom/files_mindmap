<?php

namespace OCA\Files_MindMap\AppInfo;

use OC\Files\Type\Detection;
use OCA\Files\Event\LoadAdditionalScriptsEvent;
use OCA\Files_MindMap\Listener\LoadAdditionalScripts;
use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\Files\IMimeTypeDetector;
use OCP\Security\CSP\AddContentSecurityPolicyEvent;


class Application extends App implements IBootstrap {
    const APPNAME = 'files_mindmap';

	public function __construct(array $urlParams = array()) {
		parent::__construct(self::APPNAME, $urlParams);
    }


	public function registerProvider() {
		$container = $this->getContainer();

		// Register mimetypes
		/** @var Detection $detector */
		$detector = $container->get(IMimeTypeDetector::class);
		$detector->getAllMappings();
		$detector->registerType('km','application/km');
	}

	public function register(IRegistrationContext $context): void {

		$context->registerEventListener(
			LoadAdditionalScriptsEvent::class,
			LoadAdditionalScripts::class
		);
	}

	public function boot(IBootContext $context): void {
		$this->registerProvider();

		$context->injectFn([$this, 'registerEventsSecurity']);
	}

	public function registerEventsSecurity(IEventDispatcher $dispatcher): void {
		$dispatcher->addListener(AddContentSecurityPolicyEvent::class, function (AddContentSecurityPolicyEvent $e) {
			$policy = new ContentSecurityPolicy();
			$policy->addAllowedChildSrcDomain("'self'");
			$policy->addAllowedFrameDomain("data:");
			$e->addPolicy($policy);
		});

	}
}
