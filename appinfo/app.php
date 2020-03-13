<?php

namespace OCA\Files_MindMap\AppInfo;

use OC\Security\CSP\ContentSecurityPolicy;

$eventDispatcher = \OC::$server->getEventDispatcher();

if (\OC::$server->getUserSession()->isLoggedIn()) {
    $eventDispatcher->addListener('OCA\Files::loadAdditionalScripts', function() {
        \OCP\Util::addStyle('files_mindmap', 'style');
        \OCP\Util::addScript('files_mindmap', 'jszip');
        \OCP\Util::addScript('files_mindmap', 'mindmap');
    });
}


$eventDispatcher->addListener('OCA\Files_Sharing::loadAdditionalScripts', function () {
    \OCP\Util::addStyle('files_mindmap', 'style');
    \OCP\Util::addScript('files_mindmap', 'jszip');
    \OCP\Util::addScript('files_mindmap', 'mindmap');
});


$cspManager = \OC::$server->getContentSecurityPolicyManager();
$csp = new ContentSecurityPolicy();
$csp->addAllowedChildSrcDomain("'self'");
$csp->addAllowedFrameDomain("data:");
$cspManager->addDefaultPolicy($csp);

$app = new Application();
$app->registerProvider();