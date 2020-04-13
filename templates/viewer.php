<?php
  /** @var array $_ */
  /** @var OCP\IURLGenerator $urlGenerator */
  $urlGenerator = $_['urlGenerator'];
  $version = \OCP\App::getAppVersion('files_mindmap');
  $lang = $_['lang'];
  if (method_exists(\OC::$server, 'getContentSecurityPolicyNonceManager')) {
      $nonce = \OC::$server->getContentSecurityPolicyNonceManager()->getNonce();
  } else {
      $nonce = '';
  }
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Mind Map</title>
    <base target="_blank" />


	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/bootstrap/dist/css/bootstrap.css')) ?>?v=<?php p($version) ?>" />
	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/lib/codemirror.css')) ?>?v=<?php p($version) ?>" />
	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/hotbox/hotbox.css')) ?>?v=<?php p($version) ?>" />
	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/kityminder-core/dist/kityminder.core.css')) ?>?v=<?php p($version) ?>" />
	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/color-picker/dist/color-picker.min.css')) ?>?v=<?php p($version) ?>" />


	<link rel="stylesheet" href="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/kityminder-editor/kityminder.editor.min.css')) ?>?v=<?php p($version) ?>">

	<style>
		html, body {
			margin: 0;
			padding: 0;
			height: 100%;
			overflow: hidden;
		}
		h1.editor-title {
			background: #393F4F;
			color: white;
			margin: 0;
			height: 40px;
			font-size: 14px;
			line-height: 40px;
			font-family: 'Hiragino Sans GB', 'Arial', 'Microsoft Yahei';
			font-weight: normal;
			padding: 0 20px;
		}
		div.minder-editor-container {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
		}
		#close-button {
            width: 20px;
            height: 20px;
            line-height: 20px;
            display: block;
            position: absolute;
            right:6px;
            top:6px;
            font-family: Helvetica, STHeiti;
            font-size: 18px;
            border-radius: 20px;
            background: #999;
            color: #FFF;
            box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
            -moz-transition: linear .06s;
            -webkit-transition: linear .06s;
            transition: linear .06s;
            padding: 0;
            text-align: center;
            text-decoration: none;
            outline: none;
            cursor: pointer;
			z-index: 100000;
        }
        #close-button:hover {
            width: 20px;
            height: 20px;
            line-height: 20px;
            right:6px;
            top:6px;
            color: #FFF;
            box-shadow: 0 1px 3px rgba(209, 40, 42, .5);
            background: #d1282a;
            border-radius: 24px;
            transition: all 0.2s ease-out;
            text-align: center;
            text-decoration: none;
            opacity: 0.8;
            outline: none;
        }
        #autosave-div {
            position: absolute;
            right: 280px;
            z-index: 100000;
            width: 100px;
        }
        #autosave-checkbox {
            bottom: 3px;
        }
        #save-div {
            position: absolute;
            right: 180px;
            z-index: 100000;
            width: 60px;
        }

        #export-button {
            position: absolute;
            right: 40px;
            z-index: 100000;
        }
	</style>
</head>
<script nonce="<?=$nonce?>">
    var lang = '<?=$lang?>';
</script>
<body ng-app="mindmap" ng-controller="MainController">
<a id="close-button" href="javascript:void(0);">×</a>
<div id="autosave-div" class="checkbox btn-group-vertical">
    <label>
      <input type="checkbox" id="autosave-checkbox" checked="checked" title="<?php p($l->t('AutoSave')); ?>"><?php p($l->t('AutoSave')); ?>
    </label>
  </div>
<div id="save-div" class="btn-group-vertical" >
<button id="save-button" type="button" class="btn btn-default export-caption dropdown-toggle" title="<?php p($l->t('Save')); ?>"><?php p($l->t('Save')); ?></button>
</div>
<div id="export-button" class="btn-group-vertical" dropdown is-open="isopen">
    <button type="button"
            class="btn btn-default export-caption dropdown-toggle"
            title="<?php p($l->t('Export')); ?>"
            dropdown-toggle>
        <span class="caption"><?php p($l->t('Export')); ?></span>
        <span class="caret"></span>
        <span class="sr-only"><?php p($l->t('Export')); ?></span>
    </button>
    <ul class="dropdown-menu" role="menu">
        <li>
            <a id="export-png" href"><?php p($l->t('Export to PNG')); ?></a>
        </li>
        <li>
            <a id="export-svg" href"><?php p($l->t('Export to SVG')); ?></a>
        </li>
        <li>
            <a id="export-pdf" href"><?php p($l->t('Export to PDF')); ?></a>
        </li>
        <li>
            <a id="export-markdown" href"><?php p($l->t('Export to Markdown')); ?></a>
        </li>
        <li>
            <a id="export-text" href"><?php p($l->t('Export to Text')); ?></a>
        </li>
    </ul>
</div>
<kityminder-editor id="viewer" lang="<?=$lang?>" on-init="initEditor(editor, minder)"></kityminder-editor>
</body>

<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/jquery/dist/jquery.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/bootstrap/dist/js/bootstrap.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/angular/angular.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/angular-bootstrap/ui-bootstrap-tpls.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/lib/codemirror.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/xml/xml.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/javascript/javascript.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/css/css.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/htmlmixed/htmlmixed.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/markdown/markdown.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/addon/mode/overlay.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/codemirror/mode/gfm/gfm.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/angular-ui-codemirror/ui-codemirror.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/marked/lib/marked.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/kity/dist/kity.min.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/hotbox/hotbox.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/kityminder-core/dist/kityminder.core.min.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/color-picker/dist/color-picker.min.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/js-base64/base64.min.js')) ?>?v=<?php p($version) ?>"></script>

<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/kityminder-editor/kityminder.editor.min.js')) ?>?v=<?php p($version) ?>"></script>

<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'js/viewer.js')) ?>?v=<?php p($version) ?>"></script>
<script nonce="<?=$nonce?>" src="<?php p($urlGenerator->linkTo('files_mindmap', 'vendor/jsPDF/dist/jspdf.min.js')) ?>?v=<?php p($version) ?>"></script>
</html>

