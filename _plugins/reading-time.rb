# Computes a faithful reading time for posts that `redirect:` to an external
# file (HTML essay or PDF) instead of carrying their content in the markdown
# body. Without this, `post.content` is empty and every such post shows
# "1 min read".
#
#   * HTML -> parse with Nokogiri, drop <script>/<style>, count the characters
#            of the visible text.
#   * PDF  -> decompress the FlateDecode content streams with stdlib Zlib and
#            count the characters shown by the text operators. Pure Ruby, no
#            extra gem. Falls back to a page-count estimate if a PDF cannot be
#            decoded, so the result is never worse than the old "1 min".
#
# The computed value is stored on each post as `read_time` (an integer number
# of minutes); _pages/blog.md prefers it when present.
require 'nokogiri'
require 'zlib'

module ReadingTime
  # Reading-speed constants, expressed in characters per minute so they stay
  # close to the site's prior ~180 wpm assumption.
  #   HTML text includes spaces  -> ~6 chars/word  -> 180 * 6  = 1080
  #   PDF strings are glyphs only -> ~5 chars/word -> 180 * 5  =  900
  HTML_CHARS_PER_MIN = 1080
  PDF_CHARS_PER_MIN  = 900

  # ~300 words/page * ~6 chars/word, used only when a PDF can't be decoded.
  PDF_FALLBACK_CHARS_PER_PAGE = 1800

  module_function

  def minutes(chars, chars_per_min)
    return 1 if chars.nil? || chars <= 0
    [(chars.to_f / chars_per_min).ceil, 1].max
  end

  # ----- HTML --------------------------------------------------------------
  def html_chars(path)
    html = File.read(path, encoding: 'UTF-8', invalid: :replace, undef: :replace, replace: '')
    doc = Nokogiri::HTML(html)
    doc.css('script, style, noscript').remove
    node = doc.at_css('body') || doc
    text = node.text.gsub(/\s+/, ' ').strip
    text.length
  end

  # ----- PDF ---------------------------------------------------------------
  def pdf_chars(path)
    data = File.binread(path)
    chars = 0
    # Each `stream ... endstream` block is a candidate content stream.
    data.scan(/stream\r?\n(.*?)\r?\nendstream/m) do |match|
      chars += stream_text_chars(match[0])
    end
    return chars if chars.positive?

    # Nothing decoded (unusual encoding) -> estimate from the page count so we
    # still beat a flat "1 min".
    pages = data.scan(%r{/Type\s*/Page[^s]}).size
    pages = 1 if pages < 1
    pages * PDF_FALLBACK_CHARS_PER_PAGE
  end

  # True for text content streams (delimited by BT/ET and mostly printable),
  # false for font programs and image data whose bytes can look like text.
  def content_stream?(bytes)
    return false unless bytes.include?('BT') && bytes.include?('ET')

    sample = bytes.byteslice(0, 20_000)
    return false if sample.nil? || sample.empty?

    printable = 0
    sample.each_byte do |c|
      printable += 1 if c == 9 || c == 10 || c == 13 || (c >= 32 && c <= 126)
    end
    printable.to_f / sample.bytesize > 0.85
  end

  # Count the visible characters in one content stream. Handles both
  # FlateDecode (the common case) and already-uncompressed streams.
  def stream_text_chars(raw)
    candidate = inflate(raw) || raw
    return 0 unless content_stream?(candidate)

    count = 0
    # Literal strings: ( ... ) with backslash escapes. Each escape encodes a
    # single character, so collapse them before measuring length. In a content
    # stream essentially every literal string is shown text.
    candidate.scan(/\((?:\\.|[^\\()])*\)/m) do |literal|
      inner = literal[1..-2]
      inner = inner.gsub(/\\[0-7]{1,3}/, '.').gsub(/\\./, '.')
      count += inner.length
    end
    # Subset/CID fonts show text as hex strings < ... > (2 hex digits = 1
    # glyph). The look-behind skips the << ... >> dictionary delimiter.
    candidate.scan(/(?<!<)<([0-9A-Fa-f\s]+)>/) do |match|
      count += match[0].gsub(/\s/, '').length / 2
    end
    count
  end

  def inflate(raw)
    zi = Zlib::Inflate.new
    out = zi.inflate(raw)
    begin
      out << zi.finish
    rescue Zlib::Error
      # Trailing bytes after a complete zlib stream; keep what we decoded.
    end
    out
  rescue Zlib::Error
    nil
  ensure
    zi.close if defined?(zi) && zi && !zi.closed?
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    next if post.data['read_time'] # respect a manual override in front matter

    redirect = post.data['redirect']
    next unless redirect.is_a?(String)
    next if redirect.include?('://') # external link, not a local file

    path = File.join(site.source, redirect.sub(%r{^/}, ''))
    next unless File.file?(path)

    ext = File.extname(path).downcase
    chars, cpm =
      case ext
      when '.html', '.htm' then [ReadingTime.html_chars(path), ReadingTime::HTML_CHARS_PER_MIN]
      when '.pdf'          then [ReadingTime.pdf_chars(path), ReadingTime::PDF_CHARS_PER_MIN]
      else next
      end

    post.data['read_time'] = ReadingTime.minutes(chars, cpm)
  end
end
