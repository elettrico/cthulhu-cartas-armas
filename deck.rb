# frozen_string_literal: true

require 'fileutils'
require 'squib'

ROOT = File.expand_path(__dir__)
OUTPUT = File.join(ROOT, 'output')
CARD_OUTPUT = File.join(OUTPUT, 'cards')

FileUtils.mkdir_p(CARD_OUTPUT)

data = Squib.xlsx(file: File.join(ROOT, 'data', 'armas.xlsx'))
card_count = data['Nombre'].size

display_titles = data['Nombre']
title_font_sizes = data['Nombre'].map do |name|
  name == 'Fusil de aire comprimido Coronel Moran' ? 14 : 16
end

notes = data['Nota'].map { |note| note.to_s.strip }
weapon_image_heights = notes.map { |note| note.empty? ? '30mm' : '26mm' }

weapon_images = data['im'].map do |filename|
  next nil if filename.nil? || filename.to_s.strip.empty?

  stem = File.basename(filename.to_s, File.extname(filename.to_s))
  File.join(ROOT, 'assets', 'weapons', "#{stem}.png")
end

back_images = data['tipo'].map do |type|
  File.join(ROOT, 'assets', 'backs', "back_#{type}.png")
end

stat_rows = [
  ['Base:', 'Habilidad'],
  ['Daño:', 'Dano'],
  ['Alcance:', 'Alcance'],
  ['Usos:', 'Usos'],
  ['Cargador:', 'Carg'],
  ['Coste:', 'Coste'],
  ['Defecto:', 'FD']
].freeze

Squib::Deck.new(
  width: '70mm',
  height: '99mm',
  cards: card_count,
  layout: File.join(ROOT, 'layout.yml'),
  config: File.join(ROOT, 'config.yml')
) do
  rect layout: :card_border
  png file: File.join(ROOT, 'assets', 'backgroundg2.png'), layout: :watermark
  rect layout: :title_band
  rect layout: :epoch_band

  text str: display_titles, layout: :title, font_size: title_font_sizes
  text str: data['epoca'].map { |value| "Época: #{value}" }, layout: :epoch
  png file: weapon_images, layout: :weapon_image, height: weapon_image_heights
  text str: notes, layout: :weapon_note

  stat_rows.each_with_index do |(label, column), index|
    y = 54 + (index * 6)
    text str: label, y: "#{y}mm", layout: :stat_label
    text str: data[column], y: "#{y}mm", layout: :stat_value
    line y1: "#{y - 1}mm", y2: "#{y - 1}mm", layout: :stat_line
  end

  rect x: 0, y: 0, width: :deck, height: :deck,
       fill_color: '#00000000', stroke_color: '#aa0000', stroke_width: '0.35mm'

  save_png prefix: 'front_', dir: CARD_OUTPUT
  save_pdf file: 'armas_frentes.pdf', dir: OUTPUT,
           width: '210mm', height: '297mm', margin: 0, gap: 0
end

Squib::Deck.new(
  width: '70mm',
  height: '99mm',
  cards: card_count,
  layout: File.join(ROOT, 'layout.yml'),
  config: File.join(ROOT, 'config.yml')
) do
  rect layout: :back_frame
  png file: File.join(ROOT, 'assets', 'backgroundg2.png'), layout: :watermark
  png file: File.join(ROOT, 'assets', 'coc_logo.png'), layout: :back_logo
  png file: back_images, layout: :back_type
  text str: data['Nombre'], layout: :back_title

  save_png prefix: 'back_', dir: CARD_OUTPUT
  save_pdf file: 'armas_dorsos.pdf', dir: OUTPUT,
           width: '210mm', height: '297mm', margin: 0, gap: 0, rtl: true
end

puts "Generadas #{card_count} cartas en #{OUTPUT}"

