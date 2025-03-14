<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Exercises</title>
</head>
<body>
<?php
echo "<h1>Exercise 1<br></h1>";
// Declare two variables $a and $b
$a = 15;
$b = 7;

// Compute and print their sum, difference, product, and quotient
echo "Sum: " . ($a + $b) . "<br>";
echo "Difference: " . ($a - $b) . "<br>";
echo "Product: " . ($a * $b) . "<br>";
echo "Quotient: " . ($a / $b) . "<br>";
?>

<?php //EXERCISE 2
echo "<h1>Exercise 2<br></h1>";
$number = 18;

echo "<p>";
if ($number % 2 == 0) {
    echo $number . " is even.<br>";
} else {
    echo $number . " is odd.<br>";
}

if ($number > 0) {
    echo $number . " is positive.<br>";
} elseif ($number < 0) {
    echo $number . " is negative.<br>";
} else {
    echo "The number is zero.<br>";
}
echo "</p>";
?>

<?php //EXERCISE 3
echo "<h1>Exercise 3<br></h1>";
// Task 1: Loop counting from 1 to 100
echo "<h3>FizzBuzz from 1 to 100:</h3>";
for ($i = 1; $i <= 100; $i++) {
    if ($i % 3 == 0 && $i % 5 == 0) {
        echo "FizzBuzz<br>";
    } elseif ($i % 3 == 0) {
        echo "Fizz<br>";
    } elseif ($i % 5 == 0) {
        echo "Buzz<br>";
    } else {
        echo $i . "<br>";
    }
}

echo "<br><hr><br>";

// Task 2: Even Fibonacci numbers
echo "<h3>Even Fibonacci numbers (First 10 numbers):</h3>";
$a = 0;
$b = 1;
for ($i = 0; $i < 10; $i++) {
    $c = $a + $b;
    $a = $b;
    $b = $c;

    if ($c % 2 == 0) {
        echo $c . "<br>";
    }
}
?>

<?php  //EXERCISE 4
echo "<h1>Exercise 4<br></h1>";
function greet($name) {
    return "Hello, " . htmlspecialchars($name) . "!";
}

function square($number) {
    return $number * $number;
}

echo greet("Sir JAM") . "<br>";
echo "Square of 144: " . square(144) . "<br>";
?>

<?php  // EXERCISE 5
echo "<h1>Exercise 5 - Form Handling<br></h1>";
?>
<form method="post">
    Enter text: <input type="text" name="userText">
    <input type="submit" value="Submit">
</form>
<?php
// Function to display submitted text
function displaySubmittedText($text) {
    return "You submitted the following text: " . htmlspecialchars($text);
}

// Check if the form is submitted and display the text
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['userText'])) {
    $userText = trim($_POST['userText']);  // Retrieve and sanitize the text 
    if (!empty($userText)) {
        echo displaySubmittedText($userText);
    } else {
        echo "Please enter some text.";
    }
}
?>
</body>
</html>
