# Practice 4: Global Navigation

This practice aims to implement a **Gradient Path Planning (GPP)** algorithm for a robotic taxi to navigate a city environment and reach a user-selected destination. This solution focuses on using **Wave Front Algorithm** to construct the costmap.

The solution is divided into several key steps:

1. Design a **costmap** using the **Wave Front Algorithm**.
2. Dilate the obstacle cost to keep the vehicle away from boundaries.
3. Implement **gradient-based navigation** to control the taxi's movements.

Let's dive into the implementation of each part.

## 1. Cost Map Calculation with Wave Front Algorithm



The **costmap** has been built built using a **(BFS) approach**, starting from the target and expanding outward. Each cell in the map receives a cost value that represents the distance from the target. The process includes:

- Starting at the target cell with an initial cost of zero.
- Expanding to neighboring cells, increasing the cost with each step.
- Adding these neighbors to a queue and continuing until the whole map is filled.

The computation for the cost for the cells has been done by adding the **propagated cost** to the **euclidean distance** between the current cell, and the cell from which it has been expanded.

Additionally, already explored and non-interesting cells are marked as completed, **reducing the generation time** of the costmap.

<div align="center">
    <img src="./images/p4_grid.png" height="240px">
</div>

> This idea has been implemented in the `GradientMap` class, specifically in the `build_gradient_maps()` method, where a queue-based expansion system creates the cost map.

## 2. Expansion of Obstacles

A direct use of the cost map would guide the taxi very close to obstacles, such as buildings or other fixed barriers. To address this, we implemented **obstacle dilation** to create an expanded buffer around these obstacles, increasing their effective size and making the algorithm prefer paths that keep the taxi at a safe distance.

This is achieved by applying a **dilation operation** on the map, which essentially makes obstacles "appear larger." By incrementally increasing the cost in cells adjacent to obstacles, we dissuade the taxi from navigating too close to them, thus ensuring a **safer path**.

The obstacle expansion is divided into several steps, gradually increasing the effect. This makes the transition between safe zones and obstacles smoother, providing the taxi with a more realistic navigation experience.

<div align="center">
    <img src="./images/p4_obstacles.png" height="200px">
</div>

> Note: For safety reasons the obstacles contain an infinite value as cell cost

> This idea has been implemented in the `GradientMap` class, specifically in the `_dilate_map()` method, which uses convolution-like operations to expand the obstacles' effect.

## 3. Gradient-Based Navigation

Once the cost map is built, the **gradient navigation** approach is used to determine the route. Instead of pre-calculating the entire route from start to finish, the taxi navigates by continuously moving towards the neighboring cell with the **lowest cost**.

This method allows the taxi to adapt its path dynamically, making it a **semi-reactive** navigation strategy that adjusts based on the environment and the current position of the car. At each step, the taxi considers the gradient (the direction of maximum decrease in cost) and follows it to move towards the goal.

In this implementation:

- The **next target** for the taxi is determined by searching a local area around the current position, choosing the cell with the **lowest cost**.
- The **car's movement** is based on a combination of linear and angular velocities, which are calculated using the **Vector** class to determine both direction and distance to the next cell.

This continuous gradient descent technique helps the car navigate smoothly without needing to explicitly plan a full route. It also makes it resilient to small changes in the environment since the path is adjusted at each step.

> This idea has been implemented in the `Car` class, particularly in the `get_next_target()` and `navigate_to()` methods, where the next position is determined based on the gradient map and the car's movement is controlled accordingly.

## Challenges and Observations 💡

- **Local Minimums**: There were situations where the car could get stuck in local minimums. To mitigate this, we allowed the car to slightly increase its speed whenever it stopped unexpectedly, giving it a nudge to escape the local minimum.

- **Obstacle Dilation**: Finding the correct balance for the **obstacle dilation** proved challenging. Too much dilation led to overly conservative paths, while too little resulted in unsafe paths.

## 🏁 Results

The implementation shows the taxi navigating the city environment successfully, using the gradient-based approach. The car's trajectory adapts to the changes in cost, allowing it to reach the target while keeping a safe distance from obstacles.

<div align="center">
    <video width="600" controls>
        <source src="https://github.com/user-attachments/assets/demonstration_video.mp4" type="video/mp4">
    </video>
</div>
