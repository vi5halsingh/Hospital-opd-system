// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('hospitalDB');
const sampleUsers = [
    {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "hashedpassword123",
        phoneNumber: 9876543210,
        dob: "1990-05-15",
        address: "123 Main St, New York, USA",
        category: "General",
        userType: "patient",
        otp: "123456",
        otpExpires: new Date(Date.now() + 10 * 60000), // 10 minutes from now
        isVerified: true
    },
    {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        password: "securepass456",
        phoneNumber: 9123456789,
        dob: "1985-09-20",
        address: "456 Elm St, Los Angeles, USA",
        category: "Orthopedics",
        userType: "patient",
        otp: "654321",
        otpExpires: new Date(Date.now() + 15 * 60000),
        isVerified: false
    },
    {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@example.com",
        password: "mypass789",
        phoneNumber: 9988776655,
        dob: "1995-03-10",
        address: "789 Oak St, Chicago, USA",
        category: "Pediatrics",
        userType: "patient",
        otp: "789654",
        otpExpires: new Date(Date.now() + 20 * 60000),
        isVerified: true
    },
    {
        firstName: "Emily",
        lastName: "Brown",
        email: "emily.brown@example.com",
        password: "passw0rd123",
        phoneNumber: 9871234560,
        dob: "2000-07-25",
        address: "321 Maple St, Houston, USA",
        category: "Dermatology",
        userType: "patient",
        otp: "456987",
        otpExpires: new Date(Date.now() + 30 * 60000),
        isVerified: false
    },
    {
        firstName: "Robert",
        lastName: "Williams",
        email: "robert.williams@example.com",
        password: "strongpassword",
        phoneNumber: 8765432109,
        dob: "1988-11-12",
        address: "567 Birch St, Miami, USA",
        category: "Cardiology",
        userType: "patient",
        otp: "369852",
        otpExpires: new Date(Date.now() + 25 * 60000),
        isVerified: true
    }
];



// Create a new document in the collection.
db.getCollection('signupdetails').insertMany(
    sampleUsers
);
