Ext.define('otak.view.ai.ChatBot', {
    extend: 'Ext.Panel',
    xtype: 'aichatbot',
    
    layout: 'vbox', // Use vbox instead of border
    
    items: [{
        xtype: 'container',
        flex: 1, // Takes remaining space
        scrollable: true,
        items: [{
            xtype: 'component',
            itemId: 'chatMessages',
            html: '<div class="chat-container"></div>'
        }]
    }, {
        xtype: 'container',
        layout: 'hbox',
        height: 60,
        padding: 10,
        items: [{
            xtype: 'textfield',
            flex: 1,
            itemId: 'messageField',
            placeholder: 'Ask about brain diseases...',
            listeners: {
                action: function(field) { // Use action event for Enter key
                    field.up('aichatbot').sendMessage(field.getValue());
                    field.setValue('');
                }
            }
        }, {
            xtype: 'button',
            text: 'Send',
            margin: '0 0 0 10',
            handler: function(btn) {
                var field = btn.up('container').down('textfield');
                btn.up('aichatbot').sendMessage(field.getValue());
                field.setValue('');
            }
        }]
    }],
    
    initialize: function() {
        this.callParent();
        this.loadDiseaseData();
    },
    
    loadDiseaseData: function() {
        Ext.Ajax.request({
            url: 'app/Data/brain.json',
            method: 'GET',
            success: function(response) {
                const diseases = Ext.decode(response.responseText);
                this.diseaseData = diseases;
                this.addMessage('ai', 'Hello! I\'m your brain disease assistant. I have information about ' + diseases.length + ' neurological conditions. How can I help you?');
            },
            failure: function() {
                this.addMessage('ai', 'Hello! I\'m your brain disease assistant. How can I help you?');
            },
            scope: this
        });
    },
    
    sendMessage: function(message) {
        if (!message || !message.trim()) return;
        
        this.addMessage('user', message);
        this.showTyping();
        this.getAIResponse(message);
    },
    
    getAIResponse: function(message) {
        const context = this.createContextFromData();
        this.callBackendAPI(message, context);
    },
    
    createContextFromData: function() {
        if (!this.diseaseData) return '';
        
        let context = "You are a medical AI assistant specializing in brain diseases. Here's the disease database:\n\n";
        
        this.diseaseData.forEach(disease => {
            context += `Disease: ${disease.Disease_Name}\n`;
            context += `Category: ${disease.Category}\n`;
            context += `Description: ${disease.Description}\n`;
            context += `Prevalence: ${disease.Prevalence_Range}\n\n`;
        });
        
        context += `
        # Brain Disease Diagnosis AI Assistant - System Prompt
        
        ## Core Identity
        You are a specialized medical AI assistant focused exclusively on neurological diseases and brain-related conditions. Your sole purpose is to assist with brain disease diagnosis, information, and related medical queries.
        
        ## Strict Scope Limitations
        
        ### ONLY RESPOND TO:
        - Questions about brain diseases, disorders, and conditions
        - Neurological symptoms and their potential brain-related causes
        - Brain anatomy and physiology as it relates to disease
        - Diagnostic procedures for brain conditions (MRI, CT, EEG, etc.)
        - Treatment options for brain diseases
        - Prognosis and progression of neurological conditions
        - Brain injury and trauma
        - Neurodegenerative diseases
        - Brain tumors and cancers
        - Cerebrovascular diseases (stroke, aneurysms, etc.)
        - Infectious brain diseases (meningitis, encephalitis, etc.)
        - Epilepsy and seizure disorders
        - Dementia and cognitive disorders
        - Movement disorders (Parkinson's, Huntington's, etc.)
        - Brain development disorders
        - Mental health conditions with clear neurological components
        
        ### MUST REFUSE:
        - General medical questions unrelated to the brain
        - Questions about other body systems (heart, lungs, digestive, etc.) unless directly relevant to brain function
        - Non-medical topics (politics, entertainment, general knowledge, coding, etc.)
        - Prescription or specific treatment recommendations (always defer to licensed physicians)
        - Emergency medical situations (direct to emergency services)
        - Questions about medications unless specifically for brain conditions
        - General health advice not related to neurological conditions
        - Any topic outside neurology and brain health
        
        ## Response Protocol
        
        ### For Brain-Related Queries:
        1. Provide accurate, evidence-based information
        2. Use clear, accessible language while maintaining medical accuracy
        3. Include relevant symptoms, causes, and diagnostic approaches
        4. Always include disclaimers about seeking professional medical evaluation
        5. Cite the need for imaging, lab work, or specialist consultation when appropriate
        6. Never provide definitive diagnoses - only educational information
        
        ### For Off-Topic Queries:
        Respond with:
        "I am a specialized AI assistant focused exclusively on brain diseases and neurological conditions. Your question about [topic] falls outside my area of expertise. I can only assist with:
        - Brain diseases and disorders
        - Neurological symptoms
        - Brain-related diagnostic procedures
        - Neurological conditions and their management
        
        If you have questions about brain health or neurological conditions, I'm here to help. Otherwise, please consult an appropriate medical professional or general AI assistant."
        
        ## Critical Disclaimers (Include When Relevant)
        - "This information is for educational purposes only and not a substitute for professional medical advice"
        - "If you're experiencing neurological symptoms, please seek immediate evaluation from a healthcare provider"
        - "For medical emergencies such as stroke symptoms (sudden numbness, confusion, severe headache, vision problems, difficulty walking), call emergency services immediately"
        - "Only a licensed physician can provide a definitive diagnosis based on clinical examination and diagnostic tests"
        
        ## Ethical Guidelines
        1. Never diagnose - only provide educational information about conditions
        2. Always emphasize the importance of professional medical evaluation
        3. Recognize medical emergencies and direct to emergency services
        4. Maintain patient confidentiality if discussing cases
        5. Acknowledge limitations and uncertainty when present
        6. Avoid causing unnecessary anxiety while being honest about serious conditions
        7. Do not provide specific treatment plans or medication recommendations
        
        ## Response Style
        - Professional yet compassionate
        - Clear and educational
        - Evidence-based
        - Appropriately cautious
        - Focused strictly on neurology/brain health
        
        ## Quality Standards
        - Base responses on current medical knowledge
        - Use proper medical terminology with layman explanations
        - Provide context for symptoms and conditions
        - Explain the "why" behind diagnostic approaches
        - Acknowledge when conditions require specialized sub-specialty care (neurosurgery, neuro-oncology, etc.)
        
        ---
        
        **Remember: Your expertise is brain diseases ONLY. Politely but firmly redirect all other queries.**
        `;
        
        return context;    },
    
    callBackendAPI: function(message, context) {
        Ext.Ajax.request({
            url: 'http://localhost:8000/api/chat', // Make sure this matches your Go port
            method: 'POST',
            jsonData: {
                message: message,
                context: context
            },
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(response) {
                this.hideTyping();
                const data = Ext.decode(response.responseText);
                
                if (data.success) {
                    this.addMessage('ai', data.message);
                } else {
                    this.addMessage('ai', 'Error: ' + data.error);
                    this.fallbackLocalSearch(message);
                }
            },
            failure: function(response) {
                this.hideTyping();
                console.log('Request failed:', response);
                this.addMessage('ai', 'Connection failed. Status: ' + response.status);
                this.fallbackLocalSearch(message);
            },
            scope: this
        });
    },
    
    fallbackLocalSearch: function(message) {
        if (!this.diseaseData) return;
        
        const searchTerm = message.toLowerCase();
        const matches = this.diseaseData.filter(disease => 
            disease.Disease_Name.toLowerCase().includes(searchTerm) ||
            disease.Category.toLowerCase().includes(searchTerm)
        );
        
        if (matches.length > 0) {
            let response = "From local database:\n\n";
            matches.slice(0, 3).forEach(disease => {
                response += `• <strong>${disease.Disease_Name}</strong> (${disease.Category})\n`;
                response += `  ${disease.Description}\n\n`;
            });
            this.addMessage('ai', response);
        } else {
            this.addMessage('ai', "No matching diseases found. Try Alzheimer's, Parkinson's, or Epilepsy.");
        }
    },
    
    addMessage: function(sender, message) {
        const chatContainer = this.down('#chatMessages');
        const timestamp = new Date().toLocaleTimeString();
        
        const messageHtml = `
            <div class="chat-message ${sender}">
                <div class="message-bubble">
                    <div class="message-text">${this.formatMessage(message)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            </div>
        `;
        
        const currentHtml = chatContainer.getHtml();
        chatContainer.setHtml(currentHtml + messageHtml);
        
        // Scroll to bottom
        Ext.defer(function() {
            var scrollable = chatContainer.getScrollable();
            if (scrollable) {
                scrollable.scrollToEnd();
            }
        }, 100, this);
    },
    
    formatMessage: function(message) {
        return message.replace(/\n/g, '<br>');
    },
    
    showTyping: function() {
        const chatContainer = this.down('#chatMessages');
        const typingHtml = `
            <div class="chat-message ai typing">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        
        const currentHtml = chatContainer.getHtml();
        chatContainer.setHtml(currentHtml + typingHtml);
        
        Ext.defer(function() {
            var scrollable = chatContainer.getScrollable();
            if (scrollable) {
                scrollable.scrollToEnd();
            }
        }, 100, this);
    },
    
    hideTyping: function() {
        const chatContainer = this.down('#chatMessages');
        const html = chatContainer.getHtml().replace(/<div class="chat-message ai typing">[\s\S]*?<\/div>/, '');
        chatContainer.setHtml(html);
    }
});