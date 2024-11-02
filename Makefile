app_name=files_mindmap2

project_dir=$(CURDIR)/../$(app_name)
build_dir=$(CURDIR)/build
appstore_dir=$(build_dir)/appstore
source_dir=$(build_dir)/source
sign_dir=$(build_dir)/sign
package_name=$(app_name)
cert_dir=$(CURDIR)/../../key
version+=0.0.40

all: build-front appstore

release: appstore create-tag

create-tag:
	git tag -s -a v$(version) -m "Tagging the $(version) release."
	git push origin v$(version)

clean:
	rm -rf $(build_dir)
	rm css/vendor/*

build-front:
	npm ci
	npm run build

appstore: clean
	mkdir -p $(sign_dir)
	rsync -a \
	--exclude=/build \
	--exclude=/docs \
	--exclude=/translationfiles \
	--exclude=/tests \
	--exclude=/.git \
	--exclude=/CONTRIBUTING.md \
	--exclude=/issue_template.md \
	--exclude=/README.md \
	--exclude=/.gitignore \
	--exclude=/Makefile \
	$(project_dir)/ $(sign_dir)/$(app_name)

	@if [[ -f $(cert_dir)/$(app_name).key && -f $(cert_dir)/$(app_name).crt ]]; then \
		../../occ integrity:sign-app --path $(sign_dir)/$(app_name) \
			--privateKey $(cert_dir)/$(app_name).key \
			--certificate $(cert_dir)/$(app_name).crt; \
	fi

	tar -czf $(build_dir)/$(app_name)-$(version).tar.gz \
		-C $(sign_dir) $(app_name)

	@if [ -f $(cert_dir)/$(app_name).key ]; then \
		echo "Signing package…"; \
		openssl dgst -sha512 -sign $(cert_dir)/$(app_name).key $(build_dir)/$(app_name)-$(version).tar.gz | openssl base64; \
	fi
