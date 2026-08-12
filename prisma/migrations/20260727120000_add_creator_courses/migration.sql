-- Creator Academy: Course, Lesson, StudentEnrollment

CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "lessonsCount" INTEGER NOT NULL DEFAULT 0,
    "price" TEXT NOT NULL,
    "numericPrice" INTEGER NOT NULL,
    "originalPrice" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "instructorName" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'CREATOR',
    "badgeColor" TEXT NOT NULL DEFAULT 'bg-brand text-white',
    "level" TEXT NOT NULL DEFAULT 'Creator',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "trailerVideoUrl" TEXT,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modules" JSONB,
    "instructorRole" TEXT,
    "instructorAvatar" TEXT,
    "instructorBio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Course_slug_key" ON "Course"("slug");
CREATE INDEX IF NOT EXISTS "Course_isPublished_idx" ON "Course"("isPublished");

CREATE TABLE IF NOT EXISTS "Lesson" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Lesson_courseId_idx" ON "Lesson"("courseId");

CREATE TABLE IF NOT EXISTS "StudentEnrollment" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentPhone" TEXT,
    "courseId" TEXT NOT NULL,
    "utrNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "secToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StudentEnrollment_studentEmail_idx" ON "StudentEnrollment"("studentEmail");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_courseId_idx" ON "StudentEnrollment"("courseId");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_status_idx" ON "StudentEnrollment"("status");
CREATE INDEX IF NOT EXISTS "StudentEnrollment_isBlocked_idx" ON "StudentEnrollment"("isBlocked");

DO $$ BEGIN
  ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "StudentEnrollment" ADD CONSTRAINT "StudentEnrollment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
