#info Dome Tree Distance Estimator.
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Dome Tree

uniform int Iterations;  slider[0,6,100]
uniform bool StartCurved; checkbox[true]
uniform float BendAngle; slider[0.0,0.8,2.2]
uniform int NumChildren; slider[4,8,10]
#define pi 3.1415926535897932384

void init() {
}

// distance estimation function
float DE(vec3 p)
{
   float o1 = 3.0;
   if (NumChildren <= 4)
     o1 = 5.0;
   else if (NumChildren <= 6)
     o1 = 4.0;
   float o2 = 3.0;
   float phi = (1.0+sqrt(5.0))/2.0;
   int n = NumChildren;
   float sec = 1.0 / cos(pi/o1);
   float csc = 1.0 / sin(pi/n);
   float r = sec / sqrt(csc*csc - sec*sec); 

   float l = sqrt(1.0 + r*r);

   float theta = asin(r*sin(pi - pi/o2)/l);
   float L4 =  l * sin(pi/o2 - theta)/sin(pi - pi/o2);
   float minr = L4*L4;

   float scale = 1.0;
   float bend = BendAngle;
   float omega = pi/2.0 - bend;
   float bigR = 1.0 / cos(omega);
   float d = tan(omega);

   bool recurse = StartCurved;
   for (int i = 0; i < Iterations; i++)
   {
     if (recurse)
     {
        p -= vec3(0.0,0.0,-d - bigR);
        float sc = 4.0*bigR*bigR / dot(p, p);
        p *= sc;
        scale *= sc;
        p += vec3(0.0,0.0, -2.0*bigR);
        p[2] = -p[2];
        float size = 2.0*bigR/(bigR + d);
        scale /= size;
        p /= size;
        recurse = false;
     }
     float angle = atan(p[1],p[0]);
     if (angle < 0.0)
       angle += 2.0 * pi;
     angle = mod(angle, 2.0*pi/n);
     float mag = sqrt(p[0]*p[0] + p[1]*p[1]);
     p[0] = mag * cos(angle);
     p[1] = mag * sin(angle);

     float ang1 = pi/n;
     vec3 circle_centre = l*vec3(cos(ang1), sin(ang1), 0.0);
     vec3 temp = p - circle_centre;
     float len = length(temp);
     if (len < r)
     {
        float sc = r*r / (len*len);
        temp *= sc;
        scale *= sc;
     }
     p = temp + circle_centre;

     float o2 = bend/2.0;
     float d2 = minr * tan(o2);
     float R2 = minr / cos(o2);
     vec3 mid_offset = vec3(0.0,0.0,d2);
     float amp = length(p - mid_offset);
  //   float mag4 = sqrt(p[0]*p[0] + p[1]*p[1]);
     if (amp <= R2) // || mag4 <= minr) 
     {
        p /= minr;
        scale /= minr;
        recurse  = true;        
     }
     else if (length(p) < L4)
     {
        float sc = L4*L4/dot(p,p);
        p *= sc;
        scale *= sc;
     }
  }

//  return 2.0 * (sqrt(p[2]+1.0)-1.0)/scale;
  return p[2]/scale;
}

#preset Default
FOV = 0.4
Eye = 0.637142,2.209,1.75404
Target = -1.82574,-5.71317,-3.82928
Up = -0.00626478,-0.0357212,0.999342
EquiRectangular = false
FocalPlane = 1
Aperture = 0.0002
Gamma = 2
ToneMapping = 5
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.90264
DetailAO = -2.42858
FudgeFactor = 0.2
MaxRaySteps = 330
Dither = 0
NormalBackStep = 1
AO = 0,0,0,0.83951
Specular = 0.1666
SpecularExp = 16
SpecularMax = 10
SpotLight = 1,1,1,0.27451
SpotLightDir = 0.21876,-0.21874
CamLight = 1,1,1,1.13978
CamLightMin = 0.61176
Glow = 1,1,1,0.15068
GlowMax = 62
Fog = 0.48148
HardShadow = 0.55385
ShadowSoft = 1.2904
Reflection = 0
DebugSun = false
BaseColor = 1,1,1
OrbitStrength = 0
X = 0.5,0.6,0.6,0.2126
Y = 1,0.6,0,0.30708
Z = 0.8,0.78,1,0.35434
R = 0.666667,0.666667,0.498039,0.03174
BackgroundColor = 0.278431,0.513725,0.6
GradientBackground = 0.4348
CycleColors = false
Cycles = 1.1
EnableFloor = false
FloorNormal = 0,0,0
FloorHeight = 0
FloorColor = 1,1,1
Iterations = 16
BendAngle = 1
NumChildren = 8
StartCurved = true
#endpreset
