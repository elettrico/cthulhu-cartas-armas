# frozen_string_literal: true

require 'squib'

root = File.expand_path('..', __dir__)
data = Squib.xlsx(file: File.join(root, 'data', 'armas.xlsx'))

missing = []

data['im'].each do |filename|
  next if filename.nil? || filename.to_s.strip.empty?

  stem = File.basename(filename.to_s, File.extname(filename.to_s))
  path = File.join(root, 'assets', 'weapons', "#{stem}.png")
  missing << path unless File.file?(path)
end

data['tipo'].each do |type|
  path = File.join(root, 'assets', 'backs', "back_#{type}.png")
  missing << path unless File.file?(path)
end

if missing.empty?
  puts "OK: las #{data['Nombre'].size} filas tienen imagenes disponibles."
else
  warn 'Faltan estas imagenes:'
  missing.uniq.each { |path| warn "  - #{path}" }
  exit 1
end

