import re
import sys

with open('all_hugeicons.txt', 'r') as f:
    icons = [line.replace('const ', '').strip() for line in f if line.strip()]

targets = [
    'Check', 'CheckCircle', 'Copy', 'ExternalLink', 'Link2', 'ArrowLeft', 'ArrowRight', 
    'Globe', 'Shield', 'Code', 'Sparkles', 'Loader2', 'RefreshCw', 'AlertCircle',
    'Activity', 'Clock3', 'DollarSign', 'ArrowDownRight', 'Plus', 'X', 'ChevronLeft',
    'ChevronRight', 'ChevronDown', 'MoreHorizontal', 'BarChart3', 'Layers', 'Github',
    'Menu', 'Zap', 'Lock'
]

print("Matches:")
for t in targets:
    t_lower = t.lower()
    matches = []
    
    # Try exact match or close match
    for icon in icons:
        icon_lower = icon.lower().replace('icon', '')
        if icon_lower == t_lower:
            matches.append(icon)
            
    if not matches:
        for icon in icons:
            icon_lower = icon.lower().replace('icon', '')
            if icon_lower.startswith(t_lower):
                matches.append(icon)
                
    if not matches:
        # Fallbacks for some common ones
        if 'zap' in t_lower:
            matches = [i for i in icons if 'lightning' in i.lower()]
        elif 'x' == t_lower:
            matches = [i for i in icons if 'cancel' in i.lower() or 'close' in i.lower() or 'multiply' in i.lower()]
        elif 'external' in t_lower:
            matches = [i for i in icons if 'linksquare' in i.lower() or 'external' in i.lower()]
        elif 'check' in t_lower:
            matches = [i for i in icons if 'tick' in i.lower() or 'checkmark' in i.lower()]
        elif 'loader' in t_lower:
            matches = [i for i in icons if 'loading' in i.lower()]
        elif 'refresh' in t_lower:
            matches = [i for i in icons if 'refresh' in i.lower()]
        elif 'alert' in t_lower:
            matches = [i for i in icons if 'alert' in i.lower()]
        elif 'clock' in t_lower:
            matches = [i for i in icons if 'clock' in i.lower()]
        elif 'dollar' in t_lower:
            matches = [i for i in icons if 'dollar' in i.lower()]
        elif 'chevron' in t_lower:
            direction = t_lower.replace('chevron', '')
            matches = [i for i in icons if 'arrow' + direction in i.lower()]
            
    # sort matches by length to get the simplest ones first
    matches.sort(key=lambda x: (len(x), x))
    print(f"{t}: {matches[:5]}")
