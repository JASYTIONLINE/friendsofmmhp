---
title: "McAllen Mobile Park Event Calendar Web Application - Case Study"
description: "CMPA 4304 Capstone Project Case Study documenting the development lifecycle, project management decisions, UX strategy, architecture, iteration, and lessons learned from the McAllen Mobile Park Event Calendar Web Application."
tags:
  - CMPA4304
  - Capstone
  - CaseStudy
  - ProjectManagement
  - UX
  - WebDevelopment
  - PMI
  - MobileFirst
draft: false
date: 2026-05-06
---

# McAllen Mobile Park Event Calendar Web Application  
## Case Study

**Author:** John Barkle  
**Course:** CMPA 4304 Senior Capstone Project

---

## Section 1: Problem and Context

The McAllen Mobile Park Event Calendar Web Application was developed to solve communication and accessibility problems within a residential mobile home park community. Residents relied on fragmented sources of information such as paper flyers, Facebook posts, word of mouth, and occasional bulletin board announcements to learn about recurring activities and unique events. As a result, community participation was inconsistent, events were often missed, and organizers lacked a reliable method for distributing information to residents.

The intended audience for the project was primarily older adults living within the park community. During planning and testing, it became clear that many users were not comfortable with technology. Several beta users struggled more with scanning QR codes or bookmarking a website than with using the website itself. That feedback significantly influenced later design decisions.

From the beginning, the project goal was not to create the most technically advanced platform possible. The goal was to create the simplest possible system that residents could immediately understand without training or technical knowledge. The website needed to function well on mobile phones because most residents primarily accessed the internet through smartphones. It also needed to remain readable on desktop computers and functional on tablets while maintaining large text, obvious navigation, and low cognitive load.

The project was approached using a practical project management mindset aligned with PMI principles. Stakeholders included residents, volunteer event coordinators, activity organizers, and the course sponsor through CMPA 4304. Scope, usability, and maintainability were treated as primary project constraints throughout development.

---

## Section 2: Approach and Methodology

The project was developed as a static web application using HTML, CSS, JavaScript, JSON, GitHub Pages, and embedded Google Calendar services. The decision to use lightweight architecture instead of a large framework or database-driven system was intentional. The target audience did not require advanced user accounts, complex dashboards, or highly interactive social features. The priority was reliability, clarity, and ease of maintenance.

Development began with defining the primary user workflows:

- Viewing upcoming events
- Viewing recurring weekly activities
- Accessing featured event information
- Contacting organizers
- Submitting requests for future activities or events

A mobile-first design approach was used throughout the project. Layouts were designed to minimize navigation depth and ensure users could reach most information within one or two interactions. Large buttons, readable typography, and clearly labeled page sections were emphasized across the interface.

The embedded Google Calendar became the system’s “source of truth” for dates and scheduling. JSON data structures were used to manage recurring activities, featured events, and dynamically rendered page content. This allowed updates without rebuilding the entire site while avoiding the complexity of a custom backend infrastructure.

The development process followed an iterative lifecycle. Initial prototypes focused on validating layout structure and usability. As testing continued, the project evolved based on both peer feedback and real user observations. Testing consistently showed that simplicity outperformed feature complexity for the intended audience.

AI-assisted development tools such as ChatGPT and Cursor were used to accelerate planning, debugging, content organization, and iterative refinement. However, all final project decisions, architecture choices, testing, and quality assurance remained guided by project requirements and user needs.

---

## Section 3: Key Decisions and Trade-offs

One of the most significant project decisions was choosing static architecture instead of a full-stack application with authentication, databases, and server-side processing. While a more advanced system could have supported automated submissions and resident accounts, it would have introduced additional maintenance complexity, hosting requirements, and technical overhead that did not align with the needs of the community or the scope of the project.

The trade-off was clear: fewer advanced features in exchange for higher reliability, lower maintenance requirements, and simpler user interactions. For this project, simplicity was considered more valuable than technical sophistication.

Another important architectural decision involved using Google Calendar permissions and authentication as an indirect security layer instead of building a custom authentication system directly into the website. The embedded calendar allowed authorized coordinators to rapidly update events using familiar Google tools while leveraging Google’s existing account security and permission management features. This reduced development complexity and removed the need to build custom login systems or user account management infrastructure.

An additional benefit became apparent during testing. Public users interacting with the embedded calendar would only access their own Google Calendar environment unless they had been explicitly granted administrative permissions to the community event calendar. This created a natural separation between public access and administrative control while maintaining a simple workflow for authorized event coordinators.

A second major decision involved intentionally limiting feature growth during development. Early brainstorming produced ideas including resident portals, classified listings, expanded scheduling systems, and broader community management tools. While many of these ideas had value, continuously expanding scope threatened the usability and completion of the core product.

Instead of attempting to solve every community problem, the project remained focused on its primary mission: helping residents quickly find accurate event information. This reinforced a key project management lesson learned throughout development: a focused and usable product is often more successful than an overloaded system attempting to do everything.

Another trade-off involved form submissions. Because the site does not use a backend server, event submissions were designed around structured email workflows and JSON-aligned forms instead of direct database submissions. While less automated, this approach reduced technical complexity while still supporting organized coordinator workflows.

---

## Section 4: Iteration from Project 01

The final product changed from the original Project 01 submission. Early versions of the website focused primarily on proving functionality and demonstrating basic structure. As development continued, greater emphasis was placed on usability, readability, responsiveness, and workflow clarity.

Peer review feedback consistently emphasized the importance of making the purpose of the website immediately obvious to first-time users. In response, homepage layouts, headers, featured sections, and navigation labels were refined to communicate the site’s purpose more clearly.

Community testing also influenced several significant changes. Beta users responded positively to the simplicity of the interface, but feedback revealed that highly technical interactions created confusion. This reinforced the decision to avoid unnecessary complexity and maintain familiar interaction patterns like paper calendars and community bulletin boards.

Several iterations focused specifically on mobile accessibility. Sidebars, navigation spacing, text sizing, and layout stacking behaviors were adjusted repeatedly to improve usability on smartphones. Additional visual emphasis was added to featured events so important activities would stand out more clearly.

The project also evolved administratively. Submission workflows were redesigned so that form fields aligned directly with the site’s JSON structure. This reduced cognitive load for both users and event coordinators by standardizing the information required to create new events and activities.

Not all feedback resulted in implementation. Some suggestions involved adding advanced social features or significantly expanding the scope of the platform. Those ideas were documented as future possibilities but intentionally postponed preserving project focus and ensure a polished core experience.

---

## Section 5: Evaluation of the Result

The final product successfully addresses the original communication problem by providing residents with a centralized and mobile-friendly source for community event information. The website organizes recurring activities, featured events, and scheduling information into a format that is significantly easier to navigate than fragmented social media posts or paper notices.

One of the strongest aspects of the project is its usability. Testing demonstrated that users could understand the purpose of the site quickly and navigate core features without assistance. The Mobile First layout, large interface elements, and simplified workflows aligned well with the intended audience.

The project also succeeded operationally by creating a maintainable system that does not require advanced hosting infrastructure or dedicated IT administration. Coordinators can update information through structured workflows without managing a complex backend system.

However, the project also has limitations. Because the application is static, some workflows still require manual coordinator involvement. Features such as resident authentication, automated notifications, or integrated community messaging are not currently implemented. Tablet optimization also remains less refined than the resolute mobile and desktop layouts.

Despite these limitations, the final product fulfills the original project goals while establishing a solid foundation for future expansion.

---

## Section 6: Lessons Learned

This project reinforced the importance of designing around users instead of designing around technology. Early in development, it became clear that technical capability alone does not create a successful product. Understanding user behavior, comfort levels, and expectations was more important than adding advanced functionality.

The project also strengthened my understanding of scope management and iterative development. Many potential features were intentionally deferred to preserve usability and ensure successful delivery of the core platform. That experience closely reflected real-world project management challenges involving priorities, constraints, stakeholder expectations, and resource limitations.

Another major lesson involved communication and clarity. Both the website and the supporting documentation improved significantly when decisions were framed around the user experience rather than technical implementation details. This connected directly to broader lessons learned throughout the CMPA program regarding audience-focused communication, systems thinking, and project coordination.

If starting over, I would begin structured user testing earlier and establish formal usability checkpoints sooner in the project lifecycle. I would also plan responsive layouts for desktop, tablet, and mobile simultaneously rather than refining those experiences incrementally later in development.

Overall, the project demonstrated that successful digital solutions are not defined by complexity. They are defined by how effectively they solve real problems for real users.