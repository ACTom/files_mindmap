<?php
declare(strict_types=1);

namespace OCA\Files_MindMap\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;

class DisplayController extends Controller {

	/** @var IURLGenerator */
	private $urlGenerator;

	/**
	 * @param string $AppName
	 * @param IRequest $request
	 * @param IURLGenerator $urlGenerator
	 */
	public function __construct(string $AppName,
								IRequest $request,
								IURLGenerator $urlGenerator) {
		parent::__construct($AppName, $request);
		$this->urlGenerator = $urlGenerator;
	}

	/**
	 * @PublicPage
	 * @NoCSRFRequired
	 *
	 * @param bool $minmode
	 * @return TemplateResponse
	 */
	public function showMindmapViewer(bool $minmode = false): TemplateResponse {
		$params = [
			'urlGenerator' => $this->urlGenerator,
			'minmode' => $minmode
		];
		$response = new TemplateResponse($this->appName, 'viewer', $params, 'blank');
		
		$policy = new ContentSecurityPolicy();
		$policy->addAllowedFrameDomain('\'self\'');
        $policy->addAllowedFrameDomain('data:');
        $policy->addAllowedFrameDomain('blob:');
        $policy->addAllowedObjectDomain('\'self\'');
        $policy->addAllowedObjectDomain('blob:');
		$policy->addAllowedFontDomain('data:');
		$policy->addAllowedImageDomain('*');
		$policy->allowEvalScript(true);
		$response->setContentSecurityPolicy($policy);

		return $response;
	}

}
