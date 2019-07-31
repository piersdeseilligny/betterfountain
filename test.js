
    while (i--) {
        line = src[i];
        
        if(line == ""){
          //Just an empty line, continue
          continue;
        }
  
        // title page
        if (regex.title_page.test(line)) {
          match = line.replace(regex.title_page, '\n$1').split("\n").reverse();
          for (x = 0, xlen = match.length; x < xlen; x++) {
            parts = match[x].replace(regex.cleaner, '').split(/\:\n*/);
            tokens.push({ type: parts[0].trim().toLowerCase().replace(' ', '_'), text: parts[1].trim(), line:i });
          }
          continue;
        }
  
        // scene headings
        if (match = line.match(regex.scene_heading)) {
          text = match[1] || match[2];
  
          if (text.indexOf('  ') !== text.length - 2) {
            if (meta = text.match(regex.scene_number)) {
              meta = meta[2];
              text = text.replace(regex.scene_number, '');
            }
            tokens.push({ type: 'scene_heading', text: text, scene_number: meta || undefined, line:i });
          }
          continue;
        }
  
  
        // centered
        if (match = line.match(regex.centered)) {
          tokens.push({ type: 'centered', text: match[0].replace(/>|</g, ''), line:i });
          continue;
        }
  
        // transitions
        if (match = line.match(regex.transition)) {
          tokens.push({ type: 'transition', text: match[1] || match[2], line:i });
          continue;
        }
  
      
  
        if (match = line.match(regex.dialogue)) {
          if (match[1].indexOf('  ') !== match[1].length - 2) {
            // we're iterating from the bottom up, so we need to push these backwards
            if (match[2]) {
              tokens.push({ type: 'dual_dialogue_end',line:i });
            }
  
            tokens.push({ type: 'dialogue_end',line:i });
  
            parts = match[3].split(/(\(.+\))(?:\n+)/).reverse();
  
            for (x = 0, xlen = parts.length; x < xlen; x++) { 
              text = parts[x];
  
              if (text.length > 0) {
                tokens.push({ type: regex.parenthetical.test(text) ? 'parenthetical' : 'dialogue', text: text, line:i });
              }
            }
  
              tokens.push({ type: 'character', text: match[1].replace(/\@/g, '').trim() });
            tokens.push({ type: 'dialogue_begin', dual: match[2] ? 'right' : dual ? 'left' : undefined, line:i });
  
            if (dual) {
              tokens.push({ type: 'dual_dialogue_begin',line:i });
            }
  
            dual = match[2] ? true : false;
            continue;
          }
        }
  
  
        
        // section
        if (match = line.match(regex.section)) {
          tokens.push({ type: 'section', text: match[2], depth: match[1].length, line:i });
          continue;
        }
  
  
        // lyric
        if (match = line.match(regex.lyric)) {
          tokens.push({ type: 'lyric', text: match[0].replace(/\~/, ''), line:i });
          continue;
        }
  
        
        // synopsis
        if (match = line.match(regex.synopsis)) {
          tokens.push({ type: 'synopsis', text: match[1], line:i });
          continue;
        }
  
        // notes
        if (match = line.match(regex.note)) {
          tokens.push({ type: 'note', text: match[1], line:i});
          continue;
        }      
  
        // boneyard
        if (match = line.match(regex.boneyard)) {
          tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end', line:i });
          continue;
        }      
  
        // page breaks
        if (regex.page_break.test(line)) {
          tokens.push({ type: 'page_break', line:i });
          continue;
        }
        
        // line breaks
        if (regex.line_break.test(line)) {
          tokens.push({ type: 'line_break', line:i });
          continue;
        }
  
  
          tokens.push({ type: 'action', text: line.replace(/\!/, ''), line:i });
      }