require 'fileutils'

desc 'Genera las cartas individuales y los PDF A4'
task default: :build

task :build do
  ruby 'deck.rb'
end

desc 'Comprueba que existan todas las imagenes indicadas por la planilla'
task :check do
  ruby 'scripts/check_assets.rb'
end

desc 'Borra solamente los archivos generados'
task :clean do
  FileUtils.rm_rf(Dir['output/*'])
  FileUtils.mkdir_p('output/cards')
end

