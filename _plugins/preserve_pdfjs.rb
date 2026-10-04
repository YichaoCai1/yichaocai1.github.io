# PDF.js is an upstream distribution with its own build pipeline. Jekyll Terser
# has no path exclusion, so undo its wrappers for this bundle after it runs.
# The jekyll-minifier exclusion in _config.yml then copies these files unchanged.
module Jekyll
  class PreservePdfjs < Generator
    priority :lowest

    def generate(site)
      site.static_files.map! do |file|
        if file.relative_path.start_with?("/assets/vendor/pdfjs/")
          StaticFile.new(site, site.source, File.dirname(file.relative_path), File.basename(file.path))
        else
          file
        end
      end
    end
  end
end
