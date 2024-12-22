# Monte Carlo Laser Localization 🚀

## Overview 🗺️
Monte Carlo Laser Localization is an algorithm designed to estimate a robot's position on a map using particle filters. By simulating possible positions (particles) and comparing sensor data with the map, the algorithm gradually refines its estimate of the robot's location. This implementation optimizes computational efficiency by leveraging caching and multiprocessing, achieving high accuracy and performance.

Key Features:
- **Particle Mitosis**: A genetical approach for propagating MCL particles.

- **Raytracing Sigmoidal Score**: A punctuation system based on the sigmoidal distance between theoretical and obtained lasers.

- **Asynchronous Cache**: The raytracing has been implemented with a cache for obtaining over 200% performance improvement, reducing time per iteration from 0.51 seconds up to 0.12 seconds (in the best scenario).

- **(AMCL) Dynamic Particle Reduction**: Adapts the number of particles based on cache hitmarkers.

---

## Algorithm Components 🧩

### 1. Particle Initialization
The particles represent potential robot positions and are initialized randomly in free spaces on the map.
We also ensure the particles **do not start on obstacles**.

```python
class Particle:

    @classmethod
    def random(cls) -> "Particle":
        on_obstacle = True

        while on_obstacle:
            x = random.uniform(...)
            y = random.uniform(...)
            yaw = random.uniform(...)
            on_obstacle = particle.on_obstacle()
        
        return particle
```

### 2. Weight Calculation 🎯
Each particle's weight is calculated by comparing its theoretical laser scan with the robot's actual laser scan. This weight reflects the particle's likelihood of representing the robot's true position.

```python
def raytracing_score(virtual_laser, real_laser):
    ...

    # This will be the probability of survival on the next step
    diff = abs(virtual - real) ** 2
    scores.append(sigmoid(diff))     
```

### 3. Particle Update and Convergence 🔄
Particle mitosis is a mechanism designed to maintain particle diversity and adaptability in the localization algorithm.
This process creates new particles based on existing ones, introducing slight random variations to their positions and orientations.

1. **Mitosis Trigger**:
   - Particles with higher weights are more likely to undergo **mitosis**, else, the particle will **instantly die**.
   - During mitosis, the new particle's position and orientation are altered within a small range defined by mutation parameters

2. **Validation**:
   - The new particle is checked to ensure it does not spawn on an obstacle or outside the map, if it does, it will be killed.

---

## AsyncCache: Efficient Caching for Ray Tracing 🗄️

The `AsyncCache` class is a custom caching mechanism designed to optimize raytracing computations **by storing previously calculated values and reusing them** when applicable. This class has been designed similar to the pythonic `@lru_cache`, adding the multiproccesing support to the caching methodology.

### How It Works
1. **Wrapping Raytracing**:
   - The `AsyncCache` wraps up a target function. In this case, the raytracing.
   - The wrapped function will save a key-value couple. The key will be the tuple (x,y,yaw), and the value the computed raytracing values
   - If the tuple has been previously calculated, the result is returned instantly

2. **Cache Storage**:
   - `AsyncCache` uses `Manager.dict()` from the multiprocessing library to store cached values.
   - This allows all processes to access a **shared memory space**, avoiding the overhead of copying data between processes.

> Note that we only **store the virtual laser** for the computed tuples `(x, y, yaw)`. But not its scoring, since it would depend on the position of the robot.

```python
class AsyncCache:

    def __init__(self):
        self.cache = Manager().dict()   # <- The shared memory (Up to 2Mb of space)

    @staticmethod
    def _cached_function_wrapper(args):

        ...
        cache: dict = args[0]  # <- Pointer to the shared cache
        func = args[1] # Raytracing()
        target = args[2] # (x, y, yaw)

        # Wrap the function with a cache
        cached_func = AsyncCache._get_cached_func(func, cache)  
        result = cached_func(target) # Execute the cached function

        return result
```

### Cache Cleaning
To prevent excessive memory usage, the cache is periodically cleaned:
- When the cache size exceeds a predefined limit (`MAX_CACHE_SIZE`), a subset of keys is randomly removed.
- This ensures that memory remains within acceptable bounds while retaining frequently accessed entries.

```python
def _get_cleaned_cache(self):
    if len(self.cache) > MAX_CACHE_SIZE:
        keys_to_remove = random.sample(list(self.cache.keys()), int(MAX_CACHE_SIZE * 0.4))
        for key in keys_to_remove:
            del self.cache[key]
```

### Integration with Multiprocessing
By using `Manager.dict()`, the `AsyncCache` ensures that all worker processes share the same cache. This avoids duplicating cache data in memory, reducing both memory consumption and inter-process communication overhead.

---

## Adaptative Monte Carlo Localization (AMCL) 🚀

Building on the caching system provided by `AsyncCache`, this implementation evolves from Monte Carlo Localization (MCL) to Adaptative Monte Carlo Localization (AMCL). By monitoring the cache's hit ratio, the algorithm dynamically adjusts its parameters to further enhance efficiency.

### How It Works
1. **Cache Hit Ratio Monitoring**:
   - The algorithm tracks the cache hit ratio.
   - If the hit ratio exceeds 20%, it indicates that many computations are being reused, suggesting the localization is stabilizing.

2. **Dynamic Particle and Ray Tracing Reduction**:
   - When the hit ratio surpasses 20%, the algorithm reduces:
     - The number of particles.
     - The density of ray tracing (e.g., fewer laser beams).
   - This reduces computational overhead while maintaining accurate localization.

```python
def recompute_num_of_particles():
    global NUM_PARTICLES, LASER_NUM_BEAMS, RAYTRACING_SKIP_STEPS

    if cache.hitratio > 0.2:
        NUM_PARTICLES = ORIGINAL_NUM_PARTICLES * 0.4
        LASER_NUM_BEAMS = int(ORIGINAL_NUM_BEAMS * 0.6)
        RAYTRACING_SKIP_STEPS = int(ORIGINAL_SKIPS * 2.5)
```

---

# Results:


<div align="center">
    <video width="600" controls>
        <source src="https://github.com/user-attachments/assets/a741ccc8-86ba-4f7b-bb6c-b5b4977033e7" type="video/mp4">
    </video>
</div>

