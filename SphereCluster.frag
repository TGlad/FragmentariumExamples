#info Sphere Cluster Distance Estimator.
#define providesInit
#include "DE-Raytracer.frag"
#include "MathUtils.frag"
#group Sphere Cluster

uniform int Iterations;  slider[0,6,100]
uniform float PackRatio;  slider[0,0.8,2.0] 
uniform bool Dodecahedral; checkbox[false]
uniform bool ToggleShape; checkbox[false]
uniform bool IsVoid; checkbox[false]
#define pi 3.1415926535897932384

void init() {
}

// distance estimation function
float DE(vec3 p)
{
   float phi = (1.0+sqrt(5.0))/2.0;

   // Isocahedral geometry
   vec3 ta0 = vec3(0.0,1.0,phi);
   vec3 ta1 = vec3(0.0,-1.0,phi);
   vec3 ta2 = vec3(phi,0.0,1.0);
   vec3 na0 = normalize(cross(ta0,ta1-ta0));
   vec3 na1 = normalize(cross(ta1,ta2-ta1));
   vec3 na2 = normalize(cross(ta2,ta0-ta2));
   float mid_to_edgea = atan(phi / (1.0 + 2.0*phi) );
   float xxa = 1.0 / sin(mid_to_edgea);
   float ra = 2.0 / sqrt(-4.0 + xxa*xxa); 
   float la = sqrt(1.0 + ra*ra);
   vec3 mida = normalize(ta0 + ta1 + ta2);
   float minra =  la-ra;

   // Dodecahedral geometry
   vec3 tb0 = vec3(1.0/phi,0.0,phi);
   vec3 tb1 = vec3(1.0,-1.0,1.0);
   vec3 tb2 = vec3(phi,-1.0/phi,0.0);
   vec3 tb3 = vec3(phi,1.0/phi,0.0);
   vec3 tb4 = vec3(1.0,1.0,1.0);
   vec3 nb0 = normalize(cross(tb0,tb1-tb0));
   vec3 nb1 = normalize(cross(tb1,tb2-tb1));
   vec3 nb2 = normalize(cross(tb2,tb3-tb2));
   vec3 nb3 = normalize(cross(tb3,tb4-tb3));
   vec3 nb4 = normalize(cross(tb4,tb0-tb4));
   vec3 dirb = normalize(tb0+tb1+tb2+tb3+tb4);
   float mid_to_edgeb = atan(dirb.z/dirb.x);
   float xxb = 1.0 / sin(mid_to_edgeb);
   float rb =sqrt(2.0) / sqrt(-2.0 + xxb*xxb); 
   float lb = sqrt(1.0 + rb*rb);
   vec3 midb = dirb;
   float minrb =  lb-rb;

   float k =  PackRatio;

   bool is_b = Dodecahedral;
   float minr;
   float l, r;
   vec3 mid;
   float scale = 1.0;
   float largest = length(p) - 2.0;

   bool recurse = true;
   for (int i = 0; i < Iterations; i++)
   {
     if (recurse)
     {
        if (is_b)
        {
            minr = minrb;
        }
        else
        {
           minr = minra;
        }
        if (!IsVoid)
        {
           float sc = minr/dot(p, p);
           p *= sc;
           scale /= sc;
           recurse = false;
        }
     }
     if (is_b)
     {
        l = lb;
        r = rb;
        mid = midb;
        minr = minrb;
        if (dot(p, nb0) < 0.0)
          p -= 2.0*nb0*dot(p, nb0);
        if (dot(p, nb1) < 0.0)
          p -= 2.0*nb1*dot(p, nb1);
        if (dot(p, nb2) < 0.0)
          p -= 2.0*nb2*dot(p, nb2);
        if (dot(p, nb3) < 0.0)
          p -= 2.0*nb3*dot(p, nb3);
        if (dot(p, nb4) < 0.0)
          p -= 2.0*nb4*dot(p, nb4);

        if (dot(p, nb0) < 0.0)
          p -= 2.0*nb0*dot(p, nb0);
        if (dot(p, nb1) < 0.0)
          p -= 2.0*nb1*dot(p, nb1);
        if (dot(p, nb2) < 0.0)
          p -= 2.0*nb2*dot(p, nb2);
        if (dot(p, nb3) < 0.0)
          p -= 2.0*nb3*dot(p, nb3);
        if (dot(p, nb4) < 0.0)
          p -= 2.0*nb4*dot(p, nb4);
     }
     else
     {
        l = la;
        r = ra;
        mid = mida;
        minr = minra;
        if (dot(p, na0) < 0.0)
          p -= 2.0*na0*dot(p, na0);
        if (dot(p, na1) < 0.0)
          p -= 2.0*na1*dot(p, na1);
        if (dot(p, na2) < 0.0)
          p -= 2.0*na2*dot(p, na2);

        if (dot(p, na0) < 0.0)
          p -= 2.0*na0*dot(p, na0);
        if (dot(p, na1) < 0.0)
          p -= 2.0*na1*dot(p, na1);
        if (dot(p, na2) < 0.0)
          p -= 2.0*na2*dot(p, na2);

        if (dot(p, na0) < 0.0)
          p -= 2.0*na0*dot(p, na0);
        if (dot(p, na1) < 0.0)
          p -= 2.0*na1*dot(p, na1);
        if (dot(p, na2) < 0.0)
          p -= 2.0*na2*dot(p, na2);
     }

     float dist = length(p - mid*l);
     if (dist < r || i==Iterations-1)
     {
        p -= mid*l;
        float sc = r*r / dot(p, p);
        p *= sc;
        scale /= sc;
        p += mid*l;

        float m = minr*k;
        if (length(p) < minr*(1.0+k)/2.0 && !IsVoid)
        {
           p /= m;
           scale *= m;

           if (ToggleShape)
             is_b = !is_b;
           recurse = true;
        }
     }
     if (IsVoid)
     {
        p /= minr*k;
        scale *= minr*k;
        if (ToggleShape)
          is_b = !is_b;
     }
  }
  if (IsVoid)
    minr = 0.0;
  return max(largest, (length(p) - minr*0.9*min(1.0,k))*scale);
}

#preset Default
FOV = 0.4
Eye = 1.18294,0.952283,0.751417
Target = -5.97833,-4.81364,-3.18182
Up = 0.197284,-0.0972403,0.975512
EquiRectangular = false
FocalPlane = 1
Aperture = 0.0002
Gamma = 2
ToneMapping = 1
Exposure = 1
Brightness = 1
Contrast = 1
Saturation = 1
GaussianWeight = 1
AntiAliasScale = 2
Detail = -3.22
DetailAO = -1.33
FudgeFactor = 0.46988
MaxRaySteps = 96
Dither = 0
NormalBackStep = 1
AO = 0,0,0,0.7
Specular = 0.1666
SpecularExp = 16
SpecularMax = 10
SpotLight = 1,1,1,0.03261
SpotLightDir = 0.10714,0.1
CamLight = 1,1,1,1.13978
CamLightMin = 0.61176
Glow = 1,1,1,0.05479
GlowMax = 20
Fog = 0.25926
HardShadow = 0.54867
ShadowSoft = 2
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
Iterations = 7
PackRatio = 0.8
Dodecahedral = false
ToggleShape = false
#endpreset
