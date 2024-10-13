# ⚡ Follow Line (Record with 20.36s)

This report will make a summary about the two approximations used in order to design a program to make the formula-1 racing car complete the race track in the shortest time possible.

# First Approach: Predictive Running (Summarized)
Since this idea has not been proven with high scored results, we will only summarize this approach and its core components. For completing the preddictive running the following path has been followed:

1. Fully analyse the image provided in order to define the position and center of the line
2. Define a heuristic that will predict the next position of the race car
3. Compare the prediction and the target line, and adjuts the current angular velocity to minimize the differences (PID)
4. Compute the curvature of the line and use it to control the current velocity.

### 1. Analysing the image
This analysis is based on various OpenCV filters. After the completion of the Vision core structures, the following detection could be reached:

<div align="center">
    <img src="https://github.com/user-attachments/assets/0f71a5cd-9ce7-414d-b29a-fa5be4c178fd" height="300px">
</div>


### 2. Heuristic
The heuristic was done by manually defining a non-polinomic curvature function with the linear and angular velocity as inputs:

<div align="center">
    <img src="https://github.com/user-attachments/assets/3b0cbc72-7645-48f1-a2f7-2315cded29ec" alt="predictive heuristic" height="300px">
</div>


### 3/4. Error and pid 
For the prediction, a square distance error was computed over the distance between prediction and line. For the curvature, the maximum value of the second derivative of the line was used as velocity input. Additionally an anti-oscilator pid was used to minimize the oscilations of the car.

### Results
This approach can be still seen at the commit [8c60899], however it cannot finish the track in less than 80 seconds. It is too computationally heavy to be used in high speeds.

# Final Approach: FastVision system + Frecuency Reduction
This approach tries to minimize the time for completing the track as it core target. 

For archieving this goal we need to work in the maximum frequency possible at the main while loop. For this, we follow the next steps:

1. Analyse the heaviest functions and replace/remove them into faster ones.

2. Define a minimal PID to control the car with the information obtained from the analysis

3. [Optional] Speed the car when the track is straight

### 1. Analysing the frequency of algorithms.
The class `FrequencyTester` has been implemented to print in live the final frequency of multiple algorithms. With this we obtained the following results:

1. Without any functionalities at all, the maximum frequency can oscilate between 2000-500-hz

2. By using the first approach, we maintain a frequency between 15-25hz.

<div align="center">
    <img src="https://github.com/user-attachments/assets/24009e9f-0395-42d9-8fce-dc115745cf25" alt="predictive heuristic" height="300px">
</div>

2. Just by using use functions such as `cv2.cvtColor()` or `cv2.inRange()` over the image, the frequency falls to 45-60hz.

<div align="center">
    <img src="https://github.com/user-attachments/assets/9b4b7188-a534-408d-aaca-5a1af21f1d2b" alt="predictive heuristic" height="300px">
</div>


3. Using a row based analysis without image traversal (`FastVision`), the frequency is raised over 500-600hz.

<div align="center">
    <img src="https://github.com/user-attachments/assets/725d1219-2dca-4800-afd3-afebee7a1ae1" alt="predictive heuristic" height="300px">
</div>


4. When using the functionalities `HAL.setW()` and `HAL.setV()` the frequency falls around 10 times worse (with valleys of 40hz).

5. When using the functionalities `GUI.showImage()` the frequency falls around 8 times worse.

With this analysis we have obtained the functionalities that we must avoid. For this reason, `FastVision` is a class that computes the error to the track by using row-based algorithms. 

Additionally, **we will not show any image on the screen** to maintain the timings as so as we will only update the angular and linear velocity when changes are detected.

With all of these integrations, we reached a stable frequency of 500hz (over the 20hz of the previous algorithm).

### 2. PID design
The PID uses the same structure as the last approach, with a tunning obtained by trial-error search. Note that since the frequency is high, the values of `Kp` and `Kd` are small.

In this step is important to note that the images generated from the simulation are generated slower than the current frequency obtained in the previous step, then if the image has not changed the PID must ignore the update, (it generates noise in the prediction).

```python
if image != last_image:
    pid.update(error)
```

### ⚡ 3. Adding Nitro to the car
We will use the error as an estimation of the straighteness of the line, thus, when the car detects the error is minimized, the car will speed until reaching the maximum speed defined. It will only slow down (as most as it can) when it detects a raise on the error again.

### Results
With this approximation, we can complete the track within **20-25s**. The current record obtained is **20.36s**.

Minimum Speed: 90km/h: `HAL.setV(25)`
Maximum Speed: 144km/h: `HAL.setV(40)`

<hr>

<div align="center">
    <p><strong>Results Video</strong></p>
</div>

<div align="center">
    <video width="600" controls>
        <source src="https://github.com/user-attachments/assets/c28e5dd9-8002-4a03-b47b-e5e0c6588adf" type="video/mp4">
    </video>
</div>

