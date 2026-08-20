from pathlib import Path
from PIL import Image
import numpy as np
p=Path('/home/ubuntu/copy-of-airax-ai/assets/images/vaira-chicken-target-transparent.webp')
a=np.array(Image.open(p).convert('RGBA'))
for xy in [(5,5),(a.shape[1]//2,5),(5,a.shape[0]//2),(a.shape[1]-5,5)]:
    x,y=xy
    print(xy, a[y,x].tolist())
alpha=a[:,:,3]
print('alpha corners', [int(alpha[y,x]) for x,y in [(5,5),(a.shape[1]//2,5),(5,a.shape[0]//2),(a.shape[1]-5,5)]])
