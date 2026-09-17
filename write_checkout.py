import os
os.chdir('f:/projects/B13-A8-Tiles-Gallery')

content = open('checkout_template.txt', 'r', encoding='utf-8').read()

with open('components/CheckoutView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
