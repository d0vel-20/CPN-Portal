export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const { page = 1, limit = 20, q, center, course } = req.query;

    const matchQuery: any = {};

    // General search (name, email, etc.)
    if (q) {
      matchQuery.$or = [
        { fullname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    // Center filter (only for admin users)
    if (center && user.isAdmin) {
      matchQuery.center = new mongoose.Types.ObjectId(center as string);
    } else if (!user.isAdmin) {
      // If not admin, filter by user's center
      matchQuery.center = user.user.center;
    } else {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const aggregatePipeline: any[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "paymentplans",
          localField: "plan",
          foreignField: "_id",
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "plan.course_id",
          foreignField: "_id",
          as: "plan.course",
        },
      },
      {
        $unwind: {
          path: "$plan.course",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Course filter
    if (course) {
      aggregatePipeline.push({
        $match: {
          "plan.course._id": new mongoose.Types.ObjectId(course as string),
        },
      });
    }

    // Pagination
    aggregatePipeline.push(
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );

    // Aggregation to fetch total count
    const countPipeline = [...aggregatePipeline, { $count: "totalDocuments" }];
    const totalDocumentsResult = await Student.aggregate(countPipeline);
    const totalDocuments = totalDocumentsResult[0]?.totalDocuments || 0;
    const totalPages = Math.ceil(totalDocuments / Number(limit));

    // Execute the main pipeline
    const students = await Student.aggregate(aggregatePipeline);

    const transformedStudents = students.map((student: any) => ({
      _id: student._id,
      createdAt: student.createdAt,
      fullname: student.fullname,
      email: student.email,
      phone: student.phone,
      center: student.center,
      student_id: student.student_id,
      reg_date: student.reg_date,
      course_id: student.plan?.course?._id,
      birth_date: student.birth_date,
      plan: student.plan
        ? [
            {
              _id: student.plan._id,
              amount: student.plan.amount,
              installments: student.plan.installments,
              estimate: student.plan.estimate,
              last_payment_date: student.plan.last_payment_date,
              next_payment_date: student.plan.next_payment_date,
              reg_date: student.plan.reg_date,
              course_id: student.plan.course._id,
              course_title: student.plan.course.title,
              course_duration: student.plan.course.duration,
              course_amount: student.plan.course.amount,
            },
          ]
        : [],
    }));

    const paginatedResponse = {
      saved: [],
      existingRecords: transformedStudents,
      hasPreviousPage: Number(page) > 1,
      previousPages: Number(page) - 1,
      hasNextPage: Number(page) < totalPages,
      nextPages: Number(page) + 1,
      totalPages,
      totalDocuments,
      currentPage: Number(page),
    };

    return res.status(200).json({
      status: 200,
      data: paginatedResponse,
    });
  } catch (error) {
    console.error("Error Fetching Students:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};



// Get All Students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    const { page = 1, limit = 20, q, center, course } = req.query;

    const query: any = {};

    // General search (name, email, etc.)
    if (q) {
      query.$or = [
        { fullname: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }, // assuming email is a field
      ];
    }

    // Center filter (only for admin users)
    if (center && user.isAdmin) {
      query.center = center;
    } else if (!user.isAdmin) {
      // If not admin, filter by user's center
      query.center = user.user.center;
    } else {
      return res.status(401).json({ data: "Unauthorized", status: 401 });
    }

    // Course filter
    if (course) {
      query["plan.course_id"] = course;
    }

    const totalDocuments = await Student.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / Number(limit));

    const students = await Student.find(query)
      .populate({
        path: "plan",
        model: Paymentplan,
        select:
          "amount installments estimate last_payment_date next_payment_date reg_date",
        populate: {
          path: "course_id",
          model: Course,
          select: "title duration amount",
        },
      })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const paginatedResponse = {
      saved: [],
      existingRecords: students,
      hasPreviousPage: Number(page) > 1,
      previousPages: Number(page) - 1,
      hasNextPage: Number(page) < totalPages,
      nextPages: Number(page) + 1,
      totalPages: totalPages,
      totalDocuments: totalDocuments,
      currentPage: Number(page),
    };

    return res.status(200).json({
      status: 200,
      data: paginatedResponse,
    });
  } catch (error) {
    console.error("Error Fetching Students:", error);
    return res.status(500).json({ data: "Internal Server Error", status: 500 });
  }
};





       const feScript: string = `
       echo 'starting script'
       cd ../cpnfrontend || exit 1
       echo 'Pulling latest changes from git'
       git pull origin main || exit 1
       echo 'Installing dependencies'
       npm install || exit 1
       echo 'Stopping PM2 process'
       pm2 stop cpnfrontend || exit 1
       echo 'Building the project'
       npm run build || exit 1
       echo 'Starting PM2 process'
       pm2 start cpnfrontend || exit 1
       echo 'Script finished successfully'
       `;
       app.post('/api/webhook-frontend', async (req: any, res: any) => {
        const child = spawn("bash", ["-c", feScript]);
      
        let output = '';
        let errorOccurred = false;
      
        // Capture stdout
        child.stdout.on("data", (data: Buffer) => {
          console.log(`stdout: ${data.toString()}`);
          output += data.toString();
        });
      
        // Capture stderr
        child.stderr.on("data", (data: Buffer) => {
          console.error(`stderr: ${data.toString()}`);
          output += data.toString();
          errorOccurred = true;
        });
      
        // Handle process exit
        child.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          if (code === 0 && !errorOccurred) {
            return res.status(200).json({ success: true, log: output });
          } else {
            return res.status(500).json({ success: false, log: output });
          }
        });
      
        // Handle unexpected errors
        child.on("error", (err) => {
          console.error(`Error occurred: ${err.message}`);
          return res.status(500).json({ success: false, error: err.message });
        });
      });
